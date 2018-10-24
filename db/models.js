const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({title: String, owner: String}, { strict: false });
const company = mongoose.model("company", companySchema);

const userSchema = new Schema({name: String, email: String, password: String, companyId: String}, { strict: false });
const user = mongoose.model("user", userSchema);

const projectSchema = new Schema({title: String, description: String, companyId: String}, { strict: false });
const project = mongoose.model("project", projectSchema);

const sprintSchema = new Schema({title: String, description: String, projectId: String}, { strict: false });
const sprint = mongoose.model("sprint", sprintSchema);

const issueSchema = new Schema({title: String, description: String, sprintId: String}, { strict: false });
const issue = mongoose.model("issue", issueSchema);

