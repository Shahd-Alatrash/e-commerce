import slugify from "slugify";
import cloudinary from "../../../Services/cloudinary.js";
import BrandModel from "../../../../DB/model/Brand.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createBrand = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const { categoryId } = req.body;
  if (await BrandModel.findOne({ name })) {
    return next(new Error("duplicate brand name", { cause: 409 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.APP_NAME}/'brand'}` }
  );
  const brand = await BrandModel.create({name, image: {secure_url,public_id,}, categoryId, careatedBy:req.user._id,updatedBy:req.user._id});
  return res.status(201).json({ message: "success", brand });
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  const brand = await BrandModel.findById(req.params.brandId);
  if (!brand) {
    return next(
      new Error(`invalid brand id ${req.params.brandId}`, { cause: 400 })
    );
  }
  if (req.body.name) {
    if (brand.name == req.body.name) {
      return next(new Error(`old name match new name`, { cause: 400 }));
    }
    if (await BrandModel.findOne({ name: req.body.name })) {
      return next(new Error(`duplicate brand name`, { cause: 409 }));
    }
    brand.name = req.body.name;
    brand.slug = slugify(req.body.name);
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `$process.env.APP_NAME}/brand` }
    );
    await cloudinary.uploader.destroy(brand.image.public_id);
    brand.image = {
      secure_url,
      public_id,
    };
  }
  req.body.updatedBy=req.user._id;

  await brand.save();
  return res.json({ message: "success", brand });
});

export const getAllBrands = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const brands = await BrandModel.find({ categoryId });
  return res.status(200).json({ message: "success", brands });
});
