import {defineSchema} from '../../libs/schema';
import {defineRoute} from '../../libs/route';
import EventService from '../../../service/EventService';
import {EventResponseScheme} from '../../../entity/Event';

const schema = defineSchema({
  summary: '행사를 다 가져옵니다.',
  description: '싹다!',

  response: [EventResponseScheme]
});

export default defineRoute('get', '/events', schema, async (req, res) => {
  const {userId} = req;

  const eventInformation = await EventService.getEvents();

  return res.json(eventInformation.map(e => e.toEventResponse(userId)))
});
