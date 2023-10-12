import joi from 'joi';
import { generalFeilds } from '../../Middleware/validation.js';
export const createCategory=joi.object({    /**    هاي عبارة عن سكيما  createCategory */
    name:joi.string().min(2).max(20).required(),
    file:generalFeilds.file.required()
}).required();

export const updateCategory=joi.object({   /**   ، تبع الكاتيجوري ايضا id لانه احتمال يعدل ع وحدة منهن فقط واحتمال ع التنتين ممكن اعدل على ال  required  رح يكون فيها الاسم والملف بس مش  updateCategory في ال  */
categoryId:generalFeilds.id,
name:joi.string().min(2).max(20),
    file:generalFeilds.file
}).required();


export const getSpecificCategory=joi.object({   
categoryId:generalFeilds.id,
}).required();

