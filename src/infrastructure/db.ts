import {createConnection} from "typeorm";
import ormconfig from '../ormconfig';

export async function startTypeORM() {
  const connection = await createConnection(ormconfig);
  // await connection.synchronize(true);
}
