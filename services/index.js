const router = require('express').Router();

const mongoose = require('mongoose');
const companyModel = mongoose.model('company');
const userModel = mongoose.model('user');
const projectModel = mongoose.model('project');
const sprintModel = mongoose.model('sprint');
const issueModel = mongoose.model('issue');

router.get('/', function (req, res) {
    res.send('I am a Web Server.');
});

/**
 * Register a new company.
*/
router.post('/company/register', function (req, res) {

    if (!req.body || 
        !req.body.title ||
        !req.body.owner ||
        !req.body.owner.email || !req.body.owner.password || !req.body.owner.name) {

        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { title, owner } = req.body;
    const { email, password, name } = owner;

    new companyModel({
        title,
        owner: email
    }).save(function(err, company){

        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
            return;
        }

        userModel.findOne({email}, function(err, user){
            if (err) {
                res.json({
                    success: false,
                    error: "DB operation failed."
                });
            } else if (user){
                res.json({
                    success: false,
                    error: "User exists already."
                });
            } else {
                new userModel({
                    companyId: company._id,
                    name,
                    email,
                    password: encrypt(password)
                }).save(function(err, user){
        
                    if (err) {
                        res.json({
                            success: false,
                            error: "DB operation failed."
                        });
                        return;
                    }
        
                    new projectModel({
                        companyId: company._id,
                        title: "Default Project"
                    }).save(function(err, project){
            
                        if (err) {
                            res.json({
                                success: false,
                                error: "DB operation failed."
                            });
                            return;
                        }
            
                        new sprintModel({
                            projectId: project._id,
                            title: "Default Sprint"
                        }).save(function(err, sprint){
                
                            if (err) {
                                res.json({
                                    success: false,
                                    error: "DB operation failed."
                                });
                                return;
                            }
                
                            res.json({
                                success: true,
                                company,
                                user,
                                project,
                                sprint
                            });
                
                        });
            
                    });
        
                });
            }   
        });        

    });    
});
/**
 * Get all the companies.
*/
router.get('/company/all', function (req, res) {

    companyModel.find({}, function(err, companies){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                companies
            });
        }
    });  

});

/**
 * Sign in a user.
*/
router.post('/user/signin', function(req, res) {

    if (!req.body || 
        !req.body.email ||
        !req.body.password) {

        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    let { email, password} = req.body;
    password = encrypt(password);

    userModel.findOne({email, password}, function(err, user){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else if(user) {
            res.json({
                success: true,
                user
            });
        } else {
            res.json({
                success: false
            });
        }       
    });

});
/**
 * Create a new user.
*/
router.put('/user', function (req, res) {

    if (!req.body || 
        !req.body.name ||
        !req.body.email ||
        !req.body.password ||
        !req.body.companyId) {

        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { name, email, password, companyId } = req.body;

    new userModel({
        name,
        email,
        password: encrypt(password),
        companyId
    }).save(function(err, user) {
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                user
            });
        }
    });
});
/**
 * Update an existing user.
*/
router.post('/user', function (req, res) {

    if (!req.body) {
        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { _id, name, email, password, companyId } = req.body;
    let newValues = {};
    if (name) {
        newValues.name = name;
    }
    if (email) {
        newValues.email = email;
    }
    if (password) {
        newValues.password = encrypt(password);
    }
    if (companyId) {
        newValues.companyId = companyId;
    }

    userModel.update({ _id },
        { $set: newValues }, {},            
        function(err, numAffected){
            if (err) {
                res.json({
                    success: false,
                    error: "DB operation failed."
                });
            } else {
                res.json({
                    success: true,
                    numAffected
                });
            }
    });
});
/**
 * Remove an existing user.
*/
router.delete('/user', function (req, res) {

    if (!req.body || !req.body._id) {
        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { _id } = req.body;

    userModel.remove({_id}, function(err){
            if (err) {
                res.json({
                    success: false,
                    error: "DB operation failed."
                });
            } else {
                res.json({
                    success: true
                });
            }
    });
});
/**
 * Get all the users by a company id.
*/
router.get('/users/:companyId', function (req, res) {

    userModel.find({
        companyId: req.params.companyId
    }, function(err, users){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                users
            });
        }
    });    

});
/**
 * Get all the users.
*/
router.get('/users', function (req, res) {

    userModel.find({}, function(err, users){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                users
            });
        }
    });    

});

/**
 * Create a new project.
*/
router.put('/project', function (req, res) {

    if (!req.body || 
        !req.body.title ||
        !req.body.description ||
        !req.body.companyId) {

        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { title, description, companyId } = req.body;

    new projectModel({
        title,
        description,
        companyId
    }).save(function(err, project) {
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                project
            });
        }
    });
});
/**
 * Update an existing project.
*/
router.post('/project', function (req, res) {

    if (!req.body) {
        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { _id, title, description, companyId } = req.body;
    let newValues = {};
    if (title) {
        newValues.title = title;
    }
    if (description) {
        newValues.description = description;
    }
    if (companyId) {
        newValues.companyId = companyId;
    }

    projectModel.update({ _id },
        { $set: newValues }, {},            
        function(err, numAffected){
            if (err) {
                res.json({
                    success: false,
                    error: "DB operation failed."
                });
            } else {
                res.json({
                    success: true,
                    numAffected
                });
            }
    });
});
/**
 * Remove an existing project.
*/
router.delete('/project', function (req, res) {

    if (!req.body || !req.body._id) {
        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { _id } = req.body;

    projectModel.remove({_id}, function(err){
            if (err) {
                res.json({
                    success: false,
                    error: "DB operation failed."
                });
            } else {
                res.json({
                    success: true
                });
            }
    });
});
/**
 * Get all the projects by a company id.
*/
router.get('/projects/:companyId', function (req, res) {

    projectModel.find({
        companyId: req.params.companyId
    }, function(err, projects){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                projects
            });
        }
    });    

});
/**
 * Get all the projects.
*/
router.get('/projects', function (req, res) {

    projectModel.find({}, function(err, projects){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                projects
            });
        }
    });    

});

/**
 * Create a new sprint.
*/
router.put('/sprint', function (req, res) {

    if (!req.body || 
        !req.body.title ||
        !req.body.description ||
        !req.body.projectId) {

        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { title, description, projectId } = req.body;

    new sprintModel({
        title,
        description,
        projectId
    }).save(function(err, sprint) {
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                sprint
            });
        }
    });

});
/**
 * Update an existing sprint.
*/
router.post('/sprint', function (req, res) {

    if (!req.body) {
        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { _id, title, description, projectId } = req.body;
    let newValues = {};
    if (title) {
        newValues.title = title;
    }
    if (description) {
        newValues.description = description;
    }
    if (projectId) {
        newValues.projectId = projectId;
    }

    sprintModel.update({ _id },
        { $set: newValues }, {},            
        function(err, numAffected){
            if (err) {
                res.json({
                    success: false,
                    error: "DB operation failed."
                });
            } else {
                res.json({
                    success: true,
                    numAffected
                });
            }
    });
});
/**
 * Remove an existing sprint.
*/
router.delete('/sprint', function (req, res) {

    if (!req.body || !req.body._id) {
        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { _id } = req.body;

    sprintModel.remove({_id}, function(err){
            if (err) {
                res.json({
                    success: false,
                    error: "DB operation failed."
                });
            } else {
                res.json({
                    success: true
                });
            }
    });
});
/**
 * Get all the sprints by a project id.
*/
router.get('/sprints/:projectId', function (req, res) {

    sprintModel.find({
        projectId: req.params.projectId
    }, function(err, sprints){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                sprints
            });
        }
    });    

});
/**
 * Get all the sprints.
*/
router.get('/sprints', function (req, res) {

    sprintModel.find({
    }, function(err, sprints){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                sprints
            });
        }
    });    

});

/**
 * Create a new issue.
*/
router.put('/issue', function (req, res) {

    if (!req.body || 
        !req.body.title ||
        !req.body.description ||
        !req.body.sprintId) {

        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { title, description, sprintId } = req.body;

    new issueModel({
        title,
        description,
        sprintId
    }).save(function(err, issue) {
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                issue
            });
        }
    });

});
/**
 * Update an existing issue.
*/
router.post('/issue', function (req, res) {

    if (!req.body) {
        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { _id, title, description, sprintId } = req.body;
    let newValues = {};
    if (title) {
        newValues.title = title;
    }
    if (description) {
        newValues.description = description;
    }
    if (sprintId) {
        newValues.sprintId = sprintId;
    }

    issueModel.update({ _id },
        { $set: newValues }, {},            
        function(err, numAffected){
            if (err) {
                res.json({
                    success: false,
                    error: "DB operation failed."
                });
            } else {
                res.json({
                    success: true,
                    numAffected
                });
            }
    });
});
/**
 * Remove an existing issue.
*/
router.delete('/issue', function (req, res) {

    if (!req.body || !req.body._id) {
        res.json({
            success: false,
            error: "Invalid parameters sent."
        });
        return;
    }

    const { _id } = req.body;

    issueModel.remove({_id}, function(err){
            if (err) {
                res.json({
                    success: false,
                    error: "DB operation failed."
                });
            } else {
                res.json({
                    success: true
                });
            }
    });
});
/**
 * Get all the issues by a sprint id.
*/
router.get('/issues/:sprintId', function (req, res) {

    issueModel.find({
        sprintId: req.params.sprintId
    }, function(err, issues){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                issues
            });
        }
    });    

});
/**
 * Get all the issues.
*/
router.get('/issues', function (req, res) {

    issueModel.find({
    }, function(err, issues){
        if (err) {
            res.json({
                success: false,
                error: "DB operation failed."
            });
        } else {
            res.json({
                success: true,
                issues
            });
        }
    });    

});

module.exports = router;

const crypto = require('crypto');
function encrypt(text) {
    var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}
function decrypt(text) {
    var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}