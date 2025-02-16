export interface OmikenType {
 types: Record<TypesType, string[]>;
 rules: Record<string, RulesType>;
 omikujis: Record<string, OmikujiType>;
 places: Record<string, PlaceType>;
}

export type TypesType = 'comment' | 'timer' | 'meta' | 'waitingList' | 'setList' | 'reactions' | 'unused';

export interface BaseType {
 id: string;
 name: string;
 description: string;
}

export interface RulesType extends BaseType {
 color: string;
 enableIds: string[];
 threshold: ThresholdType[];
 timerConfig?: {
  minutes: number;
  isBaseZero: boolean;
 };
}

export interface OmikujiType extends BaseType {
 rank: number;
 weight: number;
 threshold: ThresholdType[];
 status?: string;
 point?: string;
 script?: {
  scriptId: string;
  params: Record<string, string | number | boolean>;
 };
 placeIds: string[];
 post: OneCommePostType[];
}

export interface OneCommePostType {
 type: 'onecomme' | 'party' | 'speech' | 'error';
 botKey: string;
 iconKey: string;
 delaySeconds: number;
 party?: string;
 isSilent?: boolean;
 generatorParam?: string;
 content: string;
}

export interface PlaceType extends BaseType {
 placeIds: string[];
 values: PlaceValueType[];
}

export interface PlaceValueType {
 weight: number;
 value: string;
}

export interface ThresholdType {
 conditionType: 'target' | 'coolDown' | 'syoken' | 'access' | 'gift' | 'count' | 'match';
 isNot?: boolean;
 isAnd?: boolean;
 target?: number;
 coolDown?: number;
 syoken?: SyokenCondition;
 access?: AccessCondition;
 gift?: GiftCondition;
 count?: CountCondition;
 match?: MatchCondition;
}

export type ConditionType = 'target' | 'coolDown' | 'syoken' | 'access' | 'gift' | 'count' | 'match';

export interface CountCondition {
 comparison: 'min' | 'max' | 'range' | 'equal' | 'loop';
 unit: 'draws' | 'gameDraws' | 'lc' | 'tc' | 'intvlSec';
 value1: number;
 value2?: number;
}

export interface MatchCondition {
 target: 'status' | 'comment' | 'name' | 'displayName';
 case: 'exact' | 'starts' | 'include';
 value: string[];
}

export enum SyokenCondition {
 SYOKEN = 1,
 AGAIN = 2,
 HI = 3,
 ALL = 4
}

export enum AccessCondition {
 MEMBER = 2,
 MODERATOR = 3,
 ADMIN = 4
}

export enum GiftCondition {
 All = 0,
 Blue = 1,
 LightBlue = 2,
 Green = 3,
 Yellow = 4,
 Orange = 5,
 Pink = 6,
 Red = 7,
 Purple = 8
}
