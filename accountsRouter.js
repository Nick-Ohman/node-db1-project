const express = require('express');
const knex = require('./data/dbConfig.js');
const router = express.Router();

router.get('/', (req, res) => {
    knex
        .select("*")
        .from('accounts')
        .then(accounts => {
            res.status(200).json({ data: accounts});
        })
        .catch(error => {
            res.status(500).json({ message: error.message })
        })
})

router.get('/:id', validateAccountID, (req, res) => {
    // Retrieve an individual account based on ID
    // SELECT * FROM Accounts WHERE ID = req.params.id
    Accounts('accounts')
        .where({id: req.params.id})
        .first()
        .then(account => {
            res.status(200).json({
                data: account
            })
        })
        .catch(error => {
            res.status(500).json({
                errorMessage: "Error retrieving account",
                error: error
            })
        })
})

router.post('/', validateAccount, (req, res) => {
    // add a new account
    // INSERT INTO Accounts (account, 'id')
    const account = req.body;
    Accounts
        .insert(account, 'id')
        .into('accounts')
        .then(id => {
            if(id){
                res.status(201).json({
                    data: id,
                    message: "Acount Created Successfully"
                })
            }
        })
        .catch(error => {
            res.status(500).json({
                errorMessage: "Error creating Account",
                error: error
            })
        })
})

router.put('/:id', validateAccountID, validateAccount, (req, res) => {
    const account = req.body
    Accounts('accounts')
        .where({id: req.params.id})
        .update({
            name: account.name,
            budget: account.budget
        }, 'id')
        .then(count => {
            if(count > 0){
                res.status(200).json({
                    recordsUpdated: count,
                    statusMessage: "record updated successfully"
                })
            } else {
                res.status(500).json({
                    errorMessage: "Could not update account"
                })
            }
        })
        .catch(error => {
            res.status(500).json({
                errorMessage: "Error occured updating record",
                error: error
            })
        })
})

router.delete('/:id', validateAccountID, (req, res) => {
    Accounts('accounts')
        .where({id: req.params.id})
        .first()
        .del()
        .then(count => {
            if(count > 0){
                res.status(200).json({
                    deletedCount: count,
                    statusMessage: "Account deleted Successfully"
                })
            } else {
                res.status(500).json({
                    errorMessage: "Error deleting account"
                })
            }
        })
        .catch(error => {
            res.status(500).json({
                errorMessage: "Error deleting account",
                error: error
            })
        })
})


function validateAccountID(req, res, next){
    Accounts('accounts')
        .where({id: req.params.id})
        .first()
        .then(account => {
            if(account){
                next();
            } else {
                res.status(404).json({
                    errorMessage: "no account with that ID found"
                })
            }
        })
        .catch(error => {
            res.status(500).json({
                errorMessage: "Error Retrieving Account(s)",
                error: error
            })
        })
}

function validateAccount(req, res, next){
    const name = req.body.name;
    const budget = req.body.budget;
    if(!name || typeof name === String){
        res.status(400).json({
            errorMessage: "Please provide a name"
        })
    } else if (!budget || typeof budget === Number){
        res.status(400).json({
            errorMessage: "Please provide a numberical budget"
        })
    }else{
        next();
    }
    }


function isValidQuery(req, res, next){
    const query = req.query;
    if(!query.limit || !query.sortBy){
        next();
    }else if(query.limit && query.sortBy) {
        Accounts('accounts')
            .select("*")
            .limit(query.limit)
            .orderBy(query.sortBy, query.sortDir)
            .then(accounts => {
                res.status(200).json({
                    data: accounts
                })
            })
            .catch( error => {
                res.status(500).json({
                errorMessage: "Error Retrieving Accounts",
                error: error
            })
        })

    } else {
        res.status(500).json({
            errorMessage: "Error Retrieving Accounts"
        })
    }
}

module.exports = router;