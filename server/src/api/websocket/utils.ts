import { v4 as uuidv4 } from "uuid";

const generateConnectionId = () => {
  return uuidv4();
};

export default generateConnectionId;
