import {Injectable, Inject, IAfterConstruct} from "@typeix/rexxar";


@Injectable
export class MongodbConnectionProvider implements IAfterConstruct {

  @Inject("mongodb:://connection")
  mongoDbConnectionString: string;

  mongodb;

  afterConstruct(): void {

  }
}
