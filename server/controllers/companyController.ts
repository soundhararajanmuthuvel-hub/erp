import { Request, Response } from 'express';
import Company from '../models/Company';

export const getCompany = async (req: Request, res: Response) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      // Create a default company if none exists
      company = await Company.create({
        name: 'AO ERP',
        address: '123 Business Park, Industrial Area',
        phone: '+91 98765 43210',
        email: 'info@aoerp.com'
      });
    }
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { name, address, phone, email, website, gstin, pan, logo } = req.body;
    let company = await Company.findOne();
    
    if (company) {
      company.name = name || company.name;
      company.address = address || company.address;
      company.phone = phone || company.phone;
      company.email = email || company.email;
      company.website = website || company.website;
      company.gstin = gstin || company.gstin;
      company.pan = pan || company.pan;
      company.logo = logo || company.logo;
      await company.save();
    } else {
      company = await Company.create({
        name, address, phone, email, website, gstin, pan, logo
      });
    }
    
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
