const User = require("../models/User");

exports.registerWithPayment = async (req, res) => {

  try {

    const body = req.body;

    const role = body.role;

    let roleData = {};

    if (role === "vendeur") {

      roleData.seller = {
        registrationNumber: body.registrationNumber,
        rneFile: req.file ? req.file.filename : null,
        region: body.region,
        delegation: body.delegation,
        producerName: body.producerName,
        millName: body.millName,
        capacity: body.capacity,
        altitude: body.altitude
      };

    }

    if (role === "acheteur") {

      roleData.buyer = {
        buyerType: body.buyerType,
        searchRegion: body.searchRegion,
        searchCapacity: body.searchCapacity
      };

    }

    if (role === "prestataire") {

      roleData.provider = {
        proEmail: body.proEmail,
        website: body.website,
        serviceType: body.serviceType,
        instagram: body.instagram,
        facebook: body.facebook,
        linkedin: body.linkedin
      };

    }

    const user = new User({

      role: body.role,
      planId: body.planId,
      firstName: body.firstName,
      name: body.name,
      email: body.email,
      phone: body.phone,
      companyName: body.companyName,

      ...roleData

    });

    await user.save();

    const paymentUrl = `https://payment-platform.com/pay/${user._id}`;

    res.json({
      success: true,
      paymentUrl
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Registration failed"
    });

  }

};