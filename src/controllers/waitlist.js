import asyncHandler from 'express-async-handler';
import Waitlist from "../models/waitlist.js";

const waitlistController = asyncHandler(async (req, res) => {
	const {name,email,phone, city, role} = req.body
    
	const waitlsit = new Waitlist({
		name,
        email,
        city,
        phone,
        role
	});
	const createdWaitlist = await waitlsit.save();
	res.status(201).json(createdWaitlist);
});

export{
    waitlistController
}