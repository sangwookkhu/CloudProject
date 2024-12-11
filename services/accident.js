const csv = require('csv-parser');
const fs = require('fs');
const Accident = require('../schemas/accident');
const logger = require('../utils/logger');

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
              // 기존 데이터 삭제 후 새로운 데이터 입력
              await Accident.deleteMany({});
              await Accident.insertMany(results);
              logger.info(`Successfully imported ${results.length} accidents`);
              resolve(results.length);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (error) => reject(error));
      });
    } catch (error) {
      logger.error('Error importing CSV:', error);
      throw error;
    }
  }

  static async getRecentAccidents() {
    try {
      return await Accident.find()
        .sort({ occr_date: -1, occr_time: -1 })
        .limit(100);
    } catch (error) {
      logger.error('Error fetching recent accidents:', error);
      throw error;
    }
  }

  static async getAccidentsByArea(minX, maxX, minY, maxY) {
    try {
      return await Accident.find({
        grs80tm_x: { $gte: minX, $lte: maxX },
        grs80tm_y: { $gte: minY, $lte: maxY }
      });
    } catch (error) {
      logger.error('Error fetching accidents by area:', error);
      throw error;
    }
  }
}

module.exports = AccidentService;