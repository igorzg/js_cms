import {Injectable, Inject, IAfterConstruct, Logger} from "@typeix/rexxar";
import {createConnection, Connection} from "mongoose";


@Injectable
export class MongodbConnectionProvider implements IAfterConstruct {

  @Inject("MONGODB_CONNECTION")
  private connectionStr: string;

  @Inject(Logger)
  private logger: Logger;

  mongodb: Connection;

  afterConstruct(): void {
    this.logger.info("Mongodb connection string", this.connectionStr);
    this.mongodb = createConnection(this.connectionStr, {useNewUrlParser: true});
  }

}
