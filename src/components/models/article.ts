import {Injectable, Inject, IAfterConstruct} from "@typeix/rexxar";
import {MongodbConnectionProvider} from "../mongodb-connection";
import {AbstractModel} from "./abstract-model";
import {Schema} from "mongoose";


export interface Article {
  _id: string;
  created: Date;
  meta_title: string;
  meta_description: string;
  title: string;
  short_description: string;
  description: string;
  category_id?: string;
  files?: Array<string>;
}



@Injectable
export class ArticleModel extends AbstractModel<Article> implements IAfterConstruct {

  @Inject(MongodbConnectionProvider)
  private provider: MongodbConnectionProvider;

  afterConstruct(): void {
    this.model = this.provider.mongodb.model("article", new Schema({
        _id: {
          type: String,
          require: true
        },
        created: {
          type: Date,
          require: true
        },
        meta_title: {
          type: String,
          require: true
        },
        meta_description: {
          type: String,
          require: true
        },
        title: {
          type: String,
          require: true
        },
        short_description: {
          type: String,
          require: true
        },
        description: {
          type: String,
          require: true
        },
        category_id: {
          type: String
        },
        files: {
          type: Array
        }
      })
    )
  }

}
