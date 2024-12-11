const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});
const csv = require('csv-parser');
const fs = require('fs');

class AccidentService {
  static async importCSVData(filePath) {
    try {
      const results = [];
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            results.push({
              acc_id: data.acc_id,
              occr_date: data.occr_date,
              occr_time: data.occr_time,
              exp_clr_date: data.exp_clr_date,
              exp_clr_time: data.exp_clr_time,
              acc_type: data.acc_type,
              acc_dtype: data.acc_dtype,
              link_id: data.link_id,
              grs80tm_x: parseFloat(data.grs80tm_x),
              grs80tm_y: parseFloat(data.grs80tm_y),
              acc_info: data.acc_info,
              acc_road_code: parseInt(data.acc_road_code)
            });
          })
          .on('end', async () => {
            try {
              const batchSize = 25;
              for (let i = 0; i < results.length; i += batchSize) {
                const batch = results.slice(i, i + batchSize);
                const params = {
                  RequestItems: {
                    'Accidents': batch.map(item => ({
                      PutRequest: {
                        Item: item
                      }
                    }))
                  }
                };
                await dynamodb.batchWrite(params).promise();
              }
              resolve(results.length);
            } catch (error) {
              reject(error);
            }
          });
      });
    } catch (error) {
      throw error;
    }
  }

  static async getRecentAccidents() {
    const params = {
      TableName: 'Accidents',
      IndexName: 'occr_date-index',
      Limit: 100,
      ScanIndexForward: false
    };
    
    const result = await dynamodb.scan(params).promise();
    return result.Items;
  }

  static async getAccidentsByArea(minX, maxX, minY, maxY) {
    const params = {
      TableName: 'Accidents',
      FilterExpression: 
        'grs80tm_x BETWEEN :minX AND :maxX AND grs80tm_y BETWEEN :minY AND :maxY',
      ExpressionAttributeValues: {
        ':minX': minX,
        ':maxX': maxX,
        ':minY': minY,
        ':maxY': maxY
      }
    };
    
    const result = await dynamodb.scan(params).promise();
    return result.Items;
  }
}

module.exports = AccidentService;