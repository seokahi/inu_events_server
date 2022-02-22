import {z, ZodArray, ZodObject} from 'zod';
import {generateSchema} from '@anatine/zod-openapi';

type Spec = {
  summary?: string;
  description?: string;
  method: string;
  path: string;
  params?: ZodObject<any>;
  query?: ZodObject<any>;
  body?: ZodObject<any>;
  response?: ZodObject<any> | ZodArray<any>;
}

class SpecStorage {
  private specs: Spec[] = [];

  addSpec(spec: Spec) {
    this.specs.push(spec);
  }

  generateOpenApi(): any {
    return {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: '유니레터!',
        description: '유니레터 서버 API 문서입니다.',
        contact: {
          'name': '유니레터 서버팀'
        },
      },
      host: 'uniletter.inuappcenter.kr',
      basePath: '/',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      paths: this.generatePaths(),
    };
  }

  private generatePaths() {
    const pathsPart: any = {};

    const allPaths = this.specs.map(s => s.path);

    for (const path of allPaths) {
      const thisPathPart: any = {};

      const allMethods = this.specs.filter(s => s.path === path).map(s => s.method);

      for (const method of allMethods) {
        const thisSpec = this.specs.find(s => s.path === path && s.method === method)!!;

        thisPathPart[method] = {
          summary: thisSpec.summary,
          description: thisSpec.description,
          parameters: this.generateParameters(thisSpec),
          requestBody: this.generateRequestBody(thisSpec),
          responses: this.generateResponses(thisSpec)
        };
      }

      pathsPart[path] = thisPathPart;
    }

    return pathsPart;
  }

  private generateParameters({params, query}: Spec) {
    return params || query ? [
      ...(params ? Object.keys(params!!.shape).reduce(
        (carry, key) => ([
          ...carry, {in: 'path', name: key, schema: generateSchema(params!!.shape[key], true)},
        ]),
        [] as any[]
      ) : []),
      ...(query ? Object.keys(query!!.shape).reduce(
        (carry, key) => ([
          ...carry, {in: 'query', name: key, schema: generateSchema(query!!.shape[key], true)},
        ]),
        [] as any[]
      ) : [])
    ] : undefined;
  }

  private generateRequestBody({body}: Spec) {
    return body ? {
      content: {
        'application/json': {
          schema: generateSchema(body)
        },
      }
    } : undefined;
  }

  private generateResponses({response}: Spec) {
    const scheme = generateSchema(response ?? z.never())
    const errorScheme = generateSchema(z.object({
      statusCode: z.number(),
      error: z.string(),
      message: z.string()
    }));

    return {
      200: this.generateResponse('성공 응답입니다.', scheme),
      400: this.generateResponse('요청 파라미터에 문제가 있을 때의 응답입니다.', errorScheme),
      401: this.generateResponse('인증에 실패하였을 때의 응답입니다.', errorScheme),
      403: this.generateResponse('권한이 없어 요청을 처리하지 못하였을 때의 응답입니다.', errorScheme),
      404: this.generateResponse('찾고자 하는 리소스가 없어 요청을 처리하지 못하였을 때의 응답입니다.', errorScheme),
      500: this.generateResponse('서버가 요청을 처리하는 데에 문제가 생겼을 때의 응답입니다.', errorScheme)
    }
  }

  private generateResponse(description: string, schema?: any) {
    return schema ? {
      description: description,
      content: {
        'application/json': {
          schema: schema,
        }
      }
    } : undefined;
  }
}

export default new SpecStorage();