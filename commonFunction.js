function generateRandomTicketNumber  () {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomChars = [];

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomChars.push(characters[randomIndex]);
  }

  return randomChars.join("");
};

function fieldValidation(fields, inputData){
  let missingField = [];
  for (let field of fields) {
    if (
      inputData[field] === null ||
      inputData[field] === undefined ||
      inputData[field] === "" ||
      (typeof inputData[field] === "object" &&
        Object.keys(inputData[field]).length === 0)
    ) {
      missingField.push(field);
    }
  }
  if (missingField.length > 0) {
    return { status: true, fields: missingField };
  }
  return { status: false, fields: [] };
};

module.exports.generateRandomTicketNumber = generateRandomTicketNumber;
module.exports.fieldValidation = fieldValidation;
