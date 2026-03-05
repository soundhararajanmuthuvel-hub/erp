import { Request, Response } from 'express';
import Company from '../models/Company';

export const getCompany = async (req: Request, res: Response) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      // Create a default company if none exists
      company = await Company.create({
        name: 'Amudhasurabiy Organics',
        address: '123 Business Park, Industrial Area',
        phone: '+91 98765 43210',
        email: 'info@amudhasurabiy.com'
      });
    } else if (company.name === 'AO ERP' || company.name === 'NaturalFlow Manufacturing') {
      // Migrate old branding
      company.name = 'Amudhasurabiy Organics';
      if (company.email === 'info@aoerp.com' || company.email === 'info@naturalflow.com') {
        company.email = 'info@amudhasurabiy.com';
      }
      await company.save();
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
      company.name = name !== undefined ? name : company.name;
      company.address = address !== undefined ? address : company.address;
      company.phone = phone !== undefined ? phone : company.phone;
      company.email = email !== undefined ? email : company.email;
      company.website = website !== undefined ? website : company.website;
      company.gstin = gstin !== undefined ? gstin : company.gstin;
      company.pan = pan !== undefined ? pan : company.pan;
      company.logo = logo !== undefined ? logo : company.logo;
      await company.save();
    } else {
      company = await Company.create({
        name, address, phone, email, website, gstin, pan, logo
      });
    }
    
    res.json(company);
  } catch (error: any) {
    console.error('Update Company Error:', error);
    res.status(500).json({ message: error.message });
  }
};
