const router = require("express").Router();
const Agency = require("../models/agency");
const Client = require("../models/client");
const { requireSignin } = require("./verifyTokes");

router.post("/create", requireSignin, async (req, res) => {
  try {
    const agency = new Agency(req.body.agency);
    const checkAgencyByAgencyId = await Agency.findOne({
      agencyId: agency.agencyId,
    });
    if (!checkAgencyByAgencyId) {
      await agency.save();
    }
    const clientObj = {
      clientId: req.body.client.clientId,
      name: req.body.client.name,
      email: req.body.client.email,
      phoneNumber: req.body.client.phoneNumber,
      totalBill: req.body.client.totalBill,
    };
    const checkClientByClientId = await Client.findOne({
      clientId: clientObj.clientId,
    });
    if (checkClientByClientId) {
      res.status(400).json({ message: "Client already exist in DB" });
    } else {
      clientObj.agencyId = agency.agencyId;
      const client = new Client(clientObj);
      await client.save();
    }

    res.status(201).json({ message: "Agency and client created successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/update/:clientId", requireSignin, async (req, res) => {
  try {
    const { clientId } = req.params;
    const updateClientData = await Client.findByIdAndUpdate(
      clientId,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );

    return res.json({ client: updateClientData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/topclients", async (req, res) => {
  //   const topClients = await Client.find().sort({ totalBill: -1 }).limit(5);
  //   res.status(200).json(topClients);

  const data = await Client.aggregate([
    {
      $lookup: {
        from: "agencies",
        localField: "agencyId",
        foreignField: "agencyId",
        as: "topClient",
      },
    },
    {
      $project: {
        name: 1.0,
        totalBill: 1.0,
        "topClient.name": 1.0,
      },
    },
    {
      $group: {
        _id: "$topClient.name",
        maxBill: {
          $max: "$totalBill",
        },
      },
    },
    {
      $sort: {
        maxBill: -1,
      },
    },
  ]);

  res.status(200).json(data);
});

module.exports = router;
