import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from "../models/TodoItem";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import * as AWS from 'aws-sdk'

const todosTable = process.env.TODOS_TABLE;
const todosTableIndex = process.env.TODO_INDEX;

export class TodoAccess {

    private docClient: DocumentClient;

    constructor() {
        this.docClient = new AWS.DynamoDB.DocumentClient();
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        // get all TODOs of the loged in user
        const result = await this.docClient.query({
            TableName: todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = result.Items
        return items as TodoItem[];
    }

    async createTodo(newTodo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: todosTable,
            Item: newTodo
        }).promise();
        return newTodo;
    }

    async getTodoforUserAndTodoId(todoId: string, userId: string): Promise<TodoItem> {
        const todo = await this.docClient.query({
            TableName: todosTable,
            IndexName: todosTableIndex,
            KeyConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            },
            ScanIndexForward: false,
            Limit: 1
        }).promise()

        const item = todo.Items[0]
        if (item === undefined) {
            throw new Error();
        }

        return item as TodoItem;
    }

    async deleteTodo(todoId: string, userId: string): Promise<void> {
        // first get todo from database
        const item: TodoItem = await this.getTodoforUserAndTodoId(todoId, userId);
        
        // second delete item
        const createdAt = item.createdAt
        await this.docClient.delete({
            TableName: todosTable,
            Key: {
                userId,
                createdAt
            },
            ConditionExpression: "todoId = :todoId",
            ExpressionAttributeValues: {
                ":todoId": todoId
            },
        }).promise() 
    }

    async updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest): Promise<void> {
        // first get todo from database
        const item: TodoItem = await this.getTodoforUserAndTodoId(todoId, userId);

        // second update todo
        const createdAt = item.createdAt
        await this.docClient.update({
            TableName: todosTable,
            Key: {
                userId,
                createdAt
            },
            ConditionExpression: "todoId = :todoId",
            UpdateExpression: "set #name = :name, dueDate=:dueDate, done=:done",
            ExpressionAttributeValues: {
                ":name": updatedTodo.name,
                ":dueDate": updatedTodo.dueDate,
                ":done": updatedTodo.done,
                ":todoId": todoId,
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
    }
}