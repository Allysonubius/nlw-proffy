import { Request, Response } from 'express';

import db from '../database/connections';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface scheduleItem{
  week_day: number;
  from:string;
  to: string;
}

export default class ClassesController{
  async index(request: Request, response: Response) {
    //Variaveis STRING's
    const filters = request.query;
    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;
    //Error no filter class
    if (!filters.week_day || !filters.subject || !filters.time) {
      return response.status(400).json({
        error: "Missing filters to search classes"
      });
    }
    const timeMinutes = convertHourToMinutes(time);
    const classes = await db('classes')
      .whereExists(function () {
        this.select('classes_schedule.*')
        .from('classes_schedule')
          .whereRaw('`classes_schedule`.`classes_id` = `classes`.`id`')
          .whereRaw('`classes_schedule`.`week_day`= ?? ', [Number(week_day)])
          .whereRaw('`classes_schedule`.`from` <= ??', [timeMinutes])
          .whereRaw('`classes_schedule`.`to` > ??', [timeMinutes])
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'users_id')
      .select(['classes.*']['users.*']);
    return response.json(classes);
  }
  async create (request: Request, response: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule
    } = request.body;
    const trx = await db.transaction();
    try {
      const insertedUsersIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio
      });
      const user_id = insertedUsersIds[0];
      const insertedClassesIds = await trx('classes').insert({
        subject,
        cost,
        user_id
      });
      const classes_id = insertedClassesIds[0];
      const classesSchedule = schedule.map((scheduleItem:scheduleItem ) => {
        return {
          classes_id,
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.from)
        };
      })
      await trx('class_schedule').insert(classesSchedule);
      await trx.commit();
      return response.status(201).send();
    } catch (err) {
      await trx.rollback();
      return response.status(400).json({
        error: 'Unexpected error while creating new class'
      })
    }
  };
}