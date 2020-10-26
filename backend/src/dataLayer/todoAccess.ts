import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from "../models/TodoItem";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('createTodo')

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const todosTable = process.env.TODOS_TABLE;
const todosTableIndex = process.env.TODO_INDEX;

export class TodoAccess {

    private docClient: DocumentClient;

    constructor() {
        // this.docClient = new AWS.DynamoDB.DocumentClient();
        this.docClient = new XAWS.DynamoDB.DocumentClient();
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {
        logger.info('dataLayer: Start retrieving all todos for user:', userId);
        // get all TODOs of the loged in user
        const result = await this.docClient.query({
            TableName: todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = result.Items
        logger.info('dataLayer: User', userId, 'has', items.length, 'items');
        return items as TodoItem[];
    }

    async createTodo(newTodo: TodoItem): Promise<TodoItem> {
        logger.info('dataLayer: Create a new todo:', newTodo);
        await this.docClient.put({
            TableName: todosTable,
            Item: newTodo
        }).promise();
        return newTodo;
    }

    async getTodoforUserAndTodoId(todoId: string, userId: string): Promise<TodoItem> {
        logger.info('dataLayer: Get todo by id', todoId, 'for user:', userId);
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
            logger.error('dataLayer: Todo with id', todoId, 'does not exist for user', userId);
            throw new Error();
        }

        return item as TodoItem;
    }

    async deleteTodo(todoId: string, userId: string): Promise<void> {
        logger.info('dataLayer: Delete todo', todoId, 'for user:', userId);
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
        logger.info('dataLayer: Update existing todo with id', todoId, 'for user', userId);
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