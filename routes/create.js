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
        as: "agency",
      },
    },
    {
      $group: {
        _id: "$agency.name",
        doc: {
          $first: "$$ROOT",
        },
        TotalBill: {
          $max: "$totalBill",
        },
      },
    },
    {
      $sort: {
        TotalBill: -1,
      },
    },
  ]);

  const res1 = [];

  for (var i = 0; i < data.length; i++) {
    const agencyName = data[i]._id;
    const totalBill = data[i].TotalBill;
    const clientname = data[i].doc.name;

    res1.push(agencyName, totalBill, clientname);
  }

  res.status(200).json(res1);
});

module.exports = router;
