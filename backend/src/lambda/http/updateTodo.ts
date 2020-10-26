import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { updateTodo } from '../../businessLogic/todos';

const logger = createLogger('updateTodo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event);
  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  try {
    await updateTodo(todoId, updatedTodo, event);
    logger.info('Successfully udpated todo item.');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }
  catch (e) {
    logger.error('Unable to updated todo, item to be updated could not be found.');
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        'error': 'Entity not found'
      })
    }
  }
}
