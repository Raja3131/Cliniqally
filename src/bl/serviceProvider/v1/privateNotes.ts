import { v4 as uuidv4 } from "uuid";
import PrivateNotes from "../../../models/mongo/privateNotesModel";

export const createPrivateNotes = async (req: any, res: any) => {
  try {
    const { note } = req.body;
    const { provider_id } = req.serviceProviderData;
    const privateNotes = new PrivateNotes({
      provider_id,
      note,
      createdAt: new Date(),
      createdBy: req.serviceProviderData.provider_id,
      updatedAt: new Date(),
      updatedBy: req.serviceProviderData.provider_id,
      deletedAt: null,
      deletedBy: null,
      deleted: false,
    });
    const result = await privateNotes.save();
    res.status(200).json({
      message: "Private notes created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      data: error,
    });
  }
};

export const getPrivateNotes = async (req: any, res: any) => {
  try {
    const result = await PrivateNotes.find({
      deleted: false,
    }).populate("provider_id", "note");
    if (result?.length != 0) {
      res.status(200).json({
        message: "Private notes fetched successfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Private notes not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      data: error,
    });
  }
};

export const getPrivateNotesById = async (req: any, res: any) => {
  try {
    const { _id } = req.params;
    const result = await PrivateNotes.findOne({
      _id,
      deleted: false,
    }).populate("provider_id", "note");
    if (result?.length != 0) {
      res.status(200).json({
        message: "Private notes fetched successfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Private notes not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      data: error,
    });
  }
};

export const updatePrivateNotes = async (req: any, res: any) => {
  try {
    const { _id } = req.params;
    const { note } = req.body;
    const result = await PrivateNotes.findOneAndUpdate(
      { _id },
      {
        $set: {
          note,
          updatedAt: new Date(),
          updatedBy: req.serviceProviderData.provider_id,
        },
      },
      { new: true }
    ).populate("provider_id", "note");
    if (result?.length != 0) {
      res.status(200).json({
        message: "Private notes updated successfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Private notes not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      data: error,
    });
  }
};

export const deletePrivateNotes = async (req: any, res: any) => {
  try {
    const { _id } = req.params;
    const result = await PrivateNotes.findOneAndUpdate(
      { _id },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: req.serviceProviderData.provider_id,
          deleted: true,
        },
      },
      { new: true }
    ).populate("provider_id", "note");
    if (result?.length != 0) {
      res.status(200).json({
        message: "Private notes deleted successfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Private notes not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      data: error,
    });
  }
};
