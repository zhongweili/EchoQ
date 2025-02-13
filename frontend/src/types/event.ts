export interface Question {
    id: string;
    content: string;
    nickname?: string;
    isAnonymous: boolean;
    likes: number;
    timestamp: Date;
    parentId?: string;
    userName?: string;
    like_count?: number;
    followup_count: number;
    parent_id?: string;
  }

  export interface EventDetails {
    id: string;
    name: string;
    questions: Question[];
  }
