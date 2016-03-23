'use strict';

var renderSettings = function(req, res, next, oauthMessage) {
    var outcome = {};

    var getAccountData = function(callback) {
        req.app.db.Account.findOne({ where:  
                {'UserId': req.user.id}
            })
            .then(function(account) {
                if (account) {
                    outcome.account = account;
                } else {
                    console.log('Account is null');
                    throw new Error('Account is null');
                }
                callback(null, 'done');
            })
            .catch(function(err) {
                return callback(err, null);
            });
    };

    var getUserData = function(callback) {
        req.app.db.User.findById(req.user.id)
            .then(function(user) {
                outcome.user = user;
                return callback(null, 'done');
            })
            .catch(function(err) {
                callback(err, null);
            });
    };

    var asyncFinally = function(err, results) {
        if (err) {
            return next(err);
        }

        res.render('account/settings/index', {
            data: {
                account: escape(JSON.stringify(outcome.account)),
                user: escape(JSON.stringify(outcome.user))
            },
            oauthMessage: oauthMessage,
            oauthTwitter: !!req.app.config.oauth.twitter.key,
            oauthTwitterActive: outcome.user.twitter ? !!outcome.user.twitter.id : false,
            oauthGitHub: !!req.app.config.oauth.github.key,
            oauthGitHubActive: outcome.user.github ? !!outcome.user.github.id : false,
            oauthFacebook: !!req.app.config.oauth.facebook.key,
            oauthFacebookActive: outcome.user.facebook ? !!outcome.user.facebook.id : false,
            oauthGoogle: !!req.app.config.oauth.google.key,
            oauthGoogleActive: outcome.user.google ? !!outcome.user.google.id : false,
            oauthTumblr: !!req.app.config.oauth.tumblr.key,
            oauthTumblrActive: outcome.user.tumblr ? !!outcome.user.tumblr.id : false
        });
    };

    require('async').parallel([getAccountData, getUserData], asyncFinally);
};

exports.init = function(req, res, next) {
    renderSettings(req, res, next, '');
};

exports.connectTwitter = function(req, res, next) {
    req._passport.instance.authenticate('twitter', function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/account/settings/');
        }

        req.app.db.models.User.findOne({
            'twitter.id': info.profile.id,
            _id: {
                $ne: req.user.id
            }
        }, function(err, user) {
            if (err) {
                return next(err);
            }

            if (user) {
                renderSettings(req, res, next, 'Another user has already connected with that Twitter account.');
            } else {
                req.app.db.models.User.findByIdAndUpdate(req.user.id, {
                    'twitter.id': info.profile.id
                }, function(err, user) {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/account/settings/');
                });
            }
        });
    })(req, res, next);
};

exports.connectGitHub = function(req, res, next) {
    req._passport.instance.authenticate('github', function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/account/settings/');
        }

        req.app.db.models.User.findOne({
            'github.id': info.profile.id,
            _id: {
                $ne: req.user.id
            }
        }, function(err, user) {
            if (err) {
                return next(err);
            }

            if (user) {
                renderSettings(req, res, next, 'Another user has already connected with that GitHub account.');
            } else {
                req.app.db.models.User.findByIdAndUpdate(req.user.id, {
                    'github.id': info.profile.id
                }, function(err, user) {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/account/settings/');
                });
            }
        });
    })(req, res, next);
};

exports.connectFacebook = function(req, res, next) {
    req._passport.instance.authenticate('facebook', {
        callbackURL: '/account/settings/facebook/callback/'
    }, function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/account/settings/');
        }

        req.app.db.models.User.findOne({
            'facebook.id': info.profile.id,
            _id: {
                $ne: req.user.id
            }
        }, function(err, user) {
            if (err) {
                return next(err);
            }

            if (user) {
                renderSettings(req, res, next, 'Another user has already connected with that Facebook account.');
            } else {
                req.app.db.models.User.findByIdAndUpdate(req.user.id, {
                    'facebook.id': info.profile.id
                }, function(err, user) {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/account/settings/');
                });
            }
        });
    })(req, res, next);
};

exports.connectGoogle = function(req, res, next) {
    req._passport.instance.authenticate('google', {
        callbackURL: '/account/settings/google/callback/'
    }, function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/account/settings/');
        }

        req.app.db.models.User.findOne({
            'google.id': info.profile.id,
            _id: {
                $ne: req.user.id
            }
        }, function(err, user) {
            if (err) {
                return next(err);
            }

            if (user) {
                renderSettings(req, res, next, 'Another user has already connected with that Google account.');
            } else {
                req.app.db.models.User.findByIdAndUpdate(req.user.id, {
                    'google.id': info.profile.id
                }, function(err, user) {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/account/settings/');
                });
            }
        });
    })(req, res, next);
};

exports.connectTumblr = function(req, res, next) {
    req._passport.instance.authenticate('tumblr', {
        callbackURL: '/account/settings/tumblr/callback/'
    }, function(err, user, info) {
        if (!info || !info.profile) {
            return res.redirect('/account/settings/');
        }

        if (!info.profile.hasOwnProperty('id')) {
            info.profile.id = info.profile.username;
        }

        req.app.db.models.User.findOne({
            'tumblr.id': info.profile.id,
            _id: {
                $ne: req.user.id
            }
        }, function(err, user) {
            if (err) {
                return next(err);
            }

            if (user) {
                renderSettings(req, res, next, 'Another user has already connected with that Tumblr account.');
            } else {
                req.app.db.models.User.findByIdAndUpdate(req.user.id, {
                    'tumblr.id': info.profile.id
                }, function(err, user) {
                    if (err) {
                        return next(err);
                    }

                    res.redirect('/account/settings/');
                });
            }
        });
    })(req, res, next);
};

exports.disconnectTwitter = function(req, res, next) {
    req.app.db.models.User.findByIdAndUpdate(req.user.id, {
        twitter: {
            id: undefined
        }
    }, function(err, user) {
        if (err) {
            return next(err);
        }

        res.redirect('/account/settings/');
    });
};

exports.disconnectGitHub = function(req, res, next) {
    req.app.db.models.User.findByIdAndUpdate(req.user.id, {
        github: {
            id: undefined
        }
    }, function(err, user) {
        if (err) {
            return next(err);
        }

        res.redirect('/account/settings/');
    });
};

exports.disconnectFacebook = function(req, res, next) {
    req.app.db.models.User.findByIdAndUpdate(req.user.id, {
        facebook: {
            id: undefined
        }
    }, function(err, user) {
        if (err) {
            return next(err);
        }

        res.redirect('/account/settings/');
    });
};

exports.disconnectGoogle = function(req, res, next) {
    req.app.db.models.User.findByIdAndUpdate(req.user.id, {
        google: {
            id: undefined
        }
    }, function(err, user) {
        if (err) {
            return next(err);
        }

        res.redirect('/account/settings/');
    });
};

exports.disconnectTumblr = function(req, res, next) {
    req.app.db.models.User.findByIdAndUpdate(req.user.id, {
        tumblr: {
            id: undefined
        }
    }, function(err, user) {
        if (err) {
            return next(err);
        }

        res.redirect('/account/settings/');
    });
};

exports.update = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.first) {
            workflow.outcome.errfor.first = 'required';
        }

        if (!req.body.last) {
            workflow.outcome.errfor.last = 'required';
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('patchAccount');
    });

    workflow.on('patchAccount', function() {
        var fieldsToSet = {
            name: {
                first: req.body.first,
                middle: req.body.middle,
                last: req.body.last,
                full: req.body.first + ' ' + req.body.last
            },
            company: req.body.company,
            phone: req.body.phone,
            zip: req.body.zip
        };

        req.app.db.Account.findOne({ where:
                {'UserId': req.user.id}
            })
            .then(function(account) {
                account.updateAttributes(fieldsToSet)
                    .then(function(account) {
                        workflow.outcome.account = account;
                        return workflow.emit('response');
                    });
            })
            .catch(function(err) {
                return workflow.emit('exception', err);
            });
    });

    workflow.emit('validate');
};

exports.identity = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.username) {
            workflow.outcome.errfor.username = 'required';
        } else if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
            workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';
        }

        if (!req.body.email) {
            workflow.outcome.errfor.email = 'required';
        } else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
            workflow.outcome.errfor.email = 'invalid email format';
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('duplicateUsernameCheck');
    });


    workflow.on('duplicateUsernameCheck', function() {
        console.log("***Duplicate Username Check 1")
        req.app.db.User.findOne({ where: {username: req.body.username, id: {$ne: req.user.id} }  })
            .then (function(duplicateUser) {
            console.log("***Duplicate Username Check 2")
            if (duplicateUser) {
                workflow.outcome.errfor.username = 'username already taken';
                return workflow.emit('response');
            }
            workflow.emit('duplicateEmailCheck');
        })
        .catch(function(err) {
            return workflow.emit('exception', err);
        });
    });


    workflow.on('duplicateEmailCheck', function() {
        req.app.db.User.findOne({ where: { email: req.body.email.toLowerCase(), id: {$ne: req.user.id} } })
            .then (function(duplicateEmail) {
            if (duplicateEmail) {
                workflow.outcome.errfor.email = 'email already taken';
                return workflow.emit('exception', duplicateEmail);
            }
            workflow.emit('patchUser');
        })
        .catch(function(err) {
            return workflow.emit('exception', err);
        });
    });

    workflow.on('patchUser', function() {
        console.log("***Patch User 1")
        var fieldsToSet = {
            username: req.body.username,
            email: req.body.email.toLowerCase(),
            search: [
                req.body.username,
                req.body.email
            ]
        };

        req.app.db.User.update(fieldsToSet, {where: {id: req.user.id} })
            .then (function(user) {
                workflow.user = user;
                workflow.emit('patchUser');
        })
        .catch(function(err) {
            return workflow.emit('exception', err);
        });
            workflow.emit('patchAdmin');
    });

    workflow.on('patchAdmin', function(user) {
        console.log("***Patch Admin 1")
        if (user.roles.admin) {
            var fieldsToSet = {
                user: {
                    id: req.user.id,
                    name: user.username
                }
            };
            req.app.db.models.Admin.findByIdAndUpdate(user.roles.admin, fieldsToSet, function(err, admin) {
                console.log("***Patch Admin 2")
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.emit('patchAccount', user);
            });
        } else {
            workflow.emit('patchAccount', user);
        }
    });

    workflow.on('patchAccount', function(user) {
        console.log("***Patch Account 1")
        if (user.roles.account) {
            var fieldsToSet = {
                user: {
                    id: req.user.id,
                    name: user.username
                }
            };
            req.app.db.models.Account.findByIdAndUpdate(user.roles.account, fieldsToSet, function(err, account) {
                console.log("***Patch Account 2")
                if (err) {
                    return workflow.emit('exception', err);
                }

                workflow.emit('populateRoles', user);
            });
        } else {
            workflow.emit('populateRoles', user);
        }
    });

    workflow.on('populateRoles', function(user) {
        console.log("***Populate Roles 1")
        user.populate('roles.admin roles.account', 'name.full', function(err, populatedUser) {
            console.log("***Populate Roles 1")
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.user = populatedUser;
            workflow.emit('response');
        });
    });

    workflow.emit('validate');
};

exports.password = function(req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        if (!req.body.newPassword) {
            workflow.outcome.errfor.newPassword = 'required';
        }

        if (!req.body.confirm) {
            workflow.outcome.errfor.confirm = 'required';
        }

        if (req.body.newPassword !== req.body.confirm) {
            workflow.outcome.errors.push('Passwords do not match.');
        }

        if (workflow.hasErrors()) {
            return workflow.emit('response');
        }

        workflow.emit('patchUser');
    });

    workflow.on('patchUser', function() {
        req.app.db.User.encryptPassword(req.body.newPassword, function(err, hash) {
            if (err) {
                return workflow.emit('exception', err);
            }

            var fieldsToSet = {
                password: hash
            };
            req.app.db.User.update( fieldsToSet, {where: {id: req.user.id} })
                .then( function() {
                    // add some error check here
                    // get the user object
                    return req.app.db.User.findOne({ where: {id: req.user.id} })
                })
                .then( function(user, err) {
                    /*
                     * Removing this line because it gave an error after
                     * I removed the "findByIdAndUpdate()" call above.
                     * 
                     * user.populate('roles.admin roles.account', 'name.full', function(err, user) {
                     * 
                     * We aren't currently using roles, but I'm leaving
                     * it here for future reference.  It won't work as
                     * is.
                    */
                    if (err) {
                        return workflow.emit('exception', err);
                    }

                    workflow.outcome.newPassword = '';
                    workflow.outcome.confirm = '';
                    workflow.emit('response');
                })
                .catch( function (error) {
                    return workflow.emit('exception', error);
                });
        });
    });

    workflow.emit('validate');
};

