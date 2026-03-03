import { DataTypes } from "sequelize";
import { pool as db } from "../../../../config/db.js";
import Candidate from "./Candidate.js";

const CandidateRegisterDetails = db.define(
  "CandidateRegisterDetails",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Candidate, key: "id" },
    },
    full_name: { type: DataTypes.STRING(25), allowNull: false },
    phone: { type: DataTypes.STRING(15) },
    gender: { type: DataTypes.STRING(10) },
    dob: { type: DataTypes.DATE },
    address: { type: DataTypes.TEXT },
    education: { type: DataTypes.STRING(50) },
    experience: { type: DataTypes.STRING(150) },
    skills: { type: DataTypes.TEXT },
    resume_link: { type: DataTypes.STRING(150) },
  },
  {
    tableName: "candidate_register_details",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

CandidateRegisterDetails.belongsTo(Candidate, { foreignKey: "candidate_id" });

export default CandidateRegisterDetails;
