/**
 * Generates Odoo-style references, e.g. WH/IN/0001, WH/OUT/0002, WH/INT/0001, WH/ADJ/0001
 */
const generateReference = async (Model, warehouseCode, opCode) => {
  const prefix = `${warehouseCode}/${opCode}/`;
  const count = await Model.countDocuments({ reference: { $regex: `^${prefix}` } });
  const nextId = (count + 1).toString().padStart(4, "0");
  return `${prefix}${nextId}`;
};

module.exports = generateReference;
