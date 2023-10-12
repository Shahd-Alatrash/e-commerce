import joi from 'joi';
import { generalFeilds } from '../../Middleware/validation.js';

export const createSubCategory=joi.object({   
    categoryId:generalFeilds.id,
    name:joi.string().min(2).max(20).required(),
    file:generalFeilds.file.required()
}).required();

export const updateSubCategory=joi.object({  
categoryId:generalFeilds.id,
name:joi.string().min(2).max(20),
    file:generalFeilds.file
}).required();


export const getSpecificCategory=joi.object({   
categoryId:generalFeilds.id,
}).required();

