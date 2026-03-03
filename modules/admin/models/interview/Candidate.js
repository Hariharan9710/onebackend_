import { DataTypes } from "sequelize";
import { pool as db } from "../../../../config/db.js";

const Candidate = db.define(
  "Candidate",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    candidate_name: { type: DataTypes.STRING(25), allowNull: false },
    candidate_email: { type: DataTypes.STRING(30), allowNull: false },
    position: { type: DataTypes.STRING(50), allowNull: false },
    username: { type: DataTypes.STRING(25), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    email_sent: { type: DataTypes.BOOLEAN, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM(
        "EMAIL_SENT",
        "REGISTER_PENDING",
        "REGISTER_COMPLETED",
        "TEST_PENDING",
        "TEST_COMPLETED",
        "SELECTED",
        "REJECTED"
      ),
      defaultValue: "EMAIL_SENT",
    },
  },
  {
    tableName: "candidates",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Candidate;
