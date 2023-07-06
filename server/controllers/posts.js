import express from 'express';
import mongoose from 'mongoose';

import PostContract from '../models/postContract.js';

const router = express.Router();

export const getContracts = async (req, res) => { 
    try {
        const postContracts = await PostContract.find();
                
        res.status(200).json(postContracts);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getContract = async (req, res) => { 
    const { id } = req.params;

    try {
        const post = await PostContract.findById(id);
        
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createContract = async (req, res) => {
    const  content  = req.body;

    const newPostContract = new PostContract( {...content, creator: req.userId})

    try {
        await newPostContract.save();

        res.status(201).json(newPostContract );
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updateContract = async (req, res) => {
    const { id } = req.params
    const { title, contract} = req.body

    if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No contract with id: ${id}`)

    const updatedContract = { title, contract, _id: id }

    await PostContract.findByIdAndUpdate(id, updatedContract, { new: true })

    res.json(updatedContract)
}


export const deleteContract = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    await PostContract.findByIdAndRemove(id);

    res.json({ message: "Post deleted successfully." });
}

export default router;