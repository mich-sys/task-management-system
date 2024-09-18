const mongoose = require('mongoose');


const TaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true }, 
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    status: { type: String, default: 'Pending' },
});

module.exports = mongoose.model('Task', TaskSchema);