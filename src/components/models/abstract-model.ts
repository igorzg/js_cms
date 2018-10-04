import {Document, Model, Schema} from "mongoose";

export class AbstractModel<T> {
  protected model: Model<Document>;

  async removeById(id: string): Promise<boolean> {
    let result: Document = await this.model.findOneAndRemove({_id: id}).exec();
    return result.isDeleted();
  }

  async findById(id: string): Promise<Document> {
    return await this.model.findById(id).exec();
  }

  async update(id: string, data: T): Promise<Document> {
    return await this.model.findByIdAndUpdate(id, data).exec();
  }

  async create(data: T): Promise<Document> {
    return await this.model.create(data);
  }
}
