const mongoose = require('mongoose');
const { isInMemory, getMemoryStore } = require('../config/db');

// Generate unique MongoDB-like ObjectId strings
const generateObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

class ModelAdapter {
  constructor(collectionName, MongooseModel) {
    this.collectionName = collectionName.toLowerCase();
    this.MongooseModel = MongooseModel;
  }

  getStore() {
    const store = getMemoryStore();
    if (!store[this.collectionName]) {
      store[this.collectionName] = [];
    }
    return store[this.collectionName];
  }

  async find(filter = {}, sort = { createdAt: -1 }, limit = null, skip = 0) {
    if (!isInMemory()) {
      let query = this.MongooseModel.find(filter).sort(sort);
      if (skip) query = query.skip(skip);
      if (limit) query = query.limit(limit);
      return await query.lean();
    }

    const items = this.getStore();
    let result = items.filter(item => this.matchFilter(item, filter));

    // Sorting
    const sortKeys = Object.keys(sort);
    if (sortKeys.length > 0) {
      const key = sortKeys[0];
      const order = sort[key] === -1 ? -1 : 1;
      result.sort((a, b) => {
        const valA = a[key] || '';
        const valB = b[key] || '';
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });
    }

    if (skip > 0) result = result.slice(skip);
    if (limit > 0) result = result.slice(0, limit);

    return deepClone(result);
  }

  async findOne(filter = {}, select = null) {
    if (!isInMemory()) {
      let query = this.MongooseModel.findOne(filter);
      if (select) query = query.select(select);
      const res = await query.lean();
      return res;
    }

    const items = this.getStore();
    const item = items.find(doc => this.matchFilter(doc, filter));
    return item ? deepClone(item) : null;
  }

  async findById(id) {
    if (!isInMemory()) {
      return await this.MongooseModel.findById(id).lean();
    }
    const items = this.getStore();
    const idStr = id ? id.toString() : '';
    const item = items.find(doc => (doc._id && doc._id.toString() === idStr) || doc.id === idStr);
    return item ? deepClone(item) : null;
  }

  async create(data) {
    if (!isInMemory()) {
      const doc = await this.MongooseModel.create(data);
      return doc.toObject();
    }

    const items = this.getStore();
    const newDoc = {
      ...deepClone(data),
      _id: data._id ? data._id.toString() : generateObjectId(),
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date()
    };
    items.push(newDoc);
    return deepClone(newDoc);
  }

  async insertMany(dataList) {
    if (!isInMemory()) {
      const docs = await this.MongooseModel.insertMany(dataList);
      return docs.map(d => d.toObject());
    }

    const results = [];
    for (const d of dataList) {
      results.push(await this.create(d));
    }
    return results;
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    if (!isInMemory()) {
      return await this.MongooseModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    }

    const items = this.getStore();
    const idStr = id ? id.toString() : '';
    const index = items.findIndex(doc => (doc._id && doc._id.toString() === idStr) || doc.id === idStr);
    if (index === -1) return null;

    let updated = { ...items[index] };
    if (updateData.$set) {
      updated = { ...updated, ...updateData.$set, updatedAt: new Date() };
    } else {
      updated = { ...updated, ...updateData, updatedAt: new Date() };
    }

    items[index] = updated;
    return deepClone(updated);
  }

  async updateOne(filter, updateData) {
    if (!isInMemory()) {
      return await this.MongooseModel.updateOne(filter, updateData);
    }
    const item = await this.findOne(filter);
    if (!item) return { matchedCount: 0, modifiedCount: 0 };
    await this.findByIdAndUpdate(item._id, updateData);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async findByIdAndDelete(id) {
    if (!isInMemory()) {
      return await this.MongooseModel.findByIdAndDelete(id).lean();
    }

    const items = this.getStore();
    const idStr = id ? id.toString() : '';
    const index = items.findIndex(doc => (doc._id && doc._id.toString() === idStr) || doc.id === idStr);
    if (index === -1) return null;

    const [deleted] = items.splice(index, 1);
    return deepClone(deleted);
  }

  async deleteMany(filter = {}) {
    if (!isInMemory()) {
      return await this.MongooseModel.deleteMany(filter);
    }
    const store = this.getStore();
    const beforeCount = store.length;
    const remaining = store.filter(item => !this.matchFilter(item, filter));
    const deletedCount = beforeCount - remaining.length;
    const globalStore = getMemoryStore();
    globalStore[this.collectionName] = remaining;
    return { deletedCount };
  }

  async countDocuments(filter = {}) {
    if (!isInMemory()) {
      return await this.MongooseModel.countDocuments(filter);
    }
    const items = this.getStore();
    return items.filter(item => this.matchFilter(item, filter)).length;
  }

  matchFilter(doc, filter) {
    for (const key of Object.keys(filter)) {
      const filterVal = filter[key];
      if (filterVal === undefined) continue;

      if (key === '$or' && Array.isArray(filterVal)) {
        const matchAny = filterVal.some(subFilter => this.matchFilter(doc, subFilter));
        if (!matchAny) return false;
        continue;
      }

      if (key === '_id' || key === 'owner' || key === 'workflowId' || key === 'executionId') {
        const docVal = doc[key] ? doc[key].toString() : '';
        const targetVal = filterVal ? filterVal.toString() : '';
        if (docVal !== targetVal) return false;
        continue;
      }

      if (typeof filterVal === 'object' && filterVal !== null && filterVal.$regex) {
        const regex = new RegExp(filterVal.$regex, filterVal.$options || 'i');
        if (!regex.test(doc[key] || '')) return false;
        continue;
      }

      if (typeof filterVal === 'object' && filterVal !== null && filterVal.$in) {
        if (!filterVal.$in.includes(doc[key])) return false;
        continue;
      }

      if (doc[key] !== filterVal) return false;
    }
    return true;
  }
}

// Instantiate Adapters
const User = require('./User');
const Workflow = require('./Workflow');
const Execution = require('./Execution');
const ExecutionLog = require('./ExecutionLog');
const Integration = require('./Integration');
const Notification = require('./Notification');
const AgentMemory = require('./AgentMemory');

const db = {
  User: new ModelAdapter('users', User),
  Workflow: new ModelAdapter('workflows', Workflow),
  Execution: new ModelAdapter('executions', Execution),
  ExecutionLog: new ModelAdapter('executionlogs', ExecutionLog),
  Integration: new ModelAdapter('integrations', Integration),
  Notification: new ModelAdapter('notifications', Notification),
  AgentMemory: new ModelAdapter('agentmemories', AgentMemory),
  generateObjectId
};

module.exports = db;
