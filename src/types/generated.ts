/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * * `daily` - Daily
 * * `workdays` - Workdays (Mon-Fri)
 * * `weekly` - Weekly
 * * `monthly` - Monthly
 * * `yearly` - Yearly
 */
export enum RecurrenceTypeEnum {
  Daily = "daily",
  Workdays = "workdays",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

export interface LoginRequest {
  /**
   * @format email
   * @minLength 1
   */
  email: string;
  /** @minLength 1 */
  password: string;
}

export interface PaginatedRoleList {
  /** @example 123 */
  count: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results: Role[];
}

export interface PaginatedTaskCompletionListList {
  /** @example 123 */
  count: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results: TaskCompletionList[];
}

export interface PaginatedUserList {
  /** @example 123 */
  count: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results: User[];
}

export interface PatchedRoutineRequest {
  /**
   * @minLength 1
   * @maxLength 200
   */
  name?: string;
  description?: string;
}

export interface PatchedTaskRequest {
  /**
   * @minLength 1
   * @maxLength 200
   */
  title?: string;
  description?: string;
  /**
   * @format int64
   * @min 0
   * @max 9223372036854776000
   */
  order?: number;
  /**
   * * `daily` - Daily
   * * `workdays` - Workdays (Mon-Fri)
   * * `weekly` - Weekly
   * * `monthly` - Monthly
   * * `yearly` - Yearly
   */
  recurrence_type?: RecurrenceTypeEnum;
  recurrence_metadata?: any;
  /**
   * Time of day when task is due
   * @format time
   */
  due_time?: string | null;
  /** Whether to send alarm reminders */
  alarm_enabled?: boolean;
  /**
   * Minutes before due time to send alarm
   * @format int64
   * @min 0
   * @max 9223372036854776000
   */
  alarm_minutes_before?: number;
}

export interface PatchedUserProfileRequest {
  bio?: string;
  /** @format binary */
  avatar?: File | null;
  /** @maxLength 100 */
  location?: string;
  /**
   * @format uri
   * @maxLength 200
   */
  website?: string;
  /**
   * User's timezone for alarm scheduling
   * @minLength 1
   * @maxLength 50
   */
  timezone?: string;
  role_ids?: number[];
  is_public?: boolean;
}

export interface PatchedUserRequest {
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username?: string;
  /**
   * @format email
   * @minLength 1
   * @maxLength 254
   */
  email?: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /** @maxLength 20 */
  phone?: string | null;
  /** @format date */
  date_of_birth?: string | null;
  /** @minLength 1 */
  password?: string;
}

export interface Role {
  id: number;
  /** @maxLength 50 */
  name: string;
  description?: string;
  permissions?: any;
  /** @format date-time */
  created_at: string;
}

export interface RoleRequest {
  /**
   * @minLength 1
   * @maxLength 50
   */
  name: string;
  description?: string;
  permissions?: any;
}

export interface Routine {
  id: number;
  user: string;
  /** @maxLength 200 */
  name: string;
  description?: string;
  tasks: Task[];
  tasks_count: string;
  due_today_count: string;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  updated_at: string;
}

export interface RoutineRequest {
  /**
   * @minLength 1
   * @maxLength 200
   */
  name: string;
  description?: string;
}

export interface Task {
  id: number;
  routine: number;
  routine_name: string;
  /** @maxLength 200 */
  title: string;
  description?: string;
  /**
   * @format int64
   * @min 0
   * @max 9223372036854776000
   */
  order?: number;
  /**
   * * `daily` - Daily
   * * `workdays` - Workdays (Mon-Fri)
   * * `weekly` - Weekly
   * * `monthly` - Monthly
   * * `yearly` - Yearly
   */
  recurrence_type: RecurrenceTypeEnum;
  recurrence_metadata?: any;
  /**
   * Time of day when task is due
   * @format time
   */
  due_time?: string | null;
  /** Whether to send alarm reminders */
  alarm_enabled?: boolean;
  /**
   * Minutes before due time to send alarm
   * @format int64
   * @min 0
   * @max 9223372036854776000
   */
  alarm_minutes_before?: number;
  is_due_today: boolean;
  is_completed_today: boolean;
  completions_count: string;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  updated_at: string;
}

/** Serializer for marking a task as complete. */
export interface TaskCompleteRequest {
  /**
   * Optional custom completion time (defaults to now)
   * @format date-time
   */
  completion_time?: string;
}

export interface TaskCompletion {
  id: number;
  user: string;
  task: number;
  task_title: string;
  /** @format date-time */
  completed_at: string;
}

/** Detailed serializer for completion lists with pagination. */
export interface TaskCompletionList {
  id: number;
  user: string;
  task: number;
  task_title: string;
  routine_name: string;
  /** @format date-time */
  completed_at: string;
}

/** Serializer for reordering tasks within a routine. */
export interface TaskReorderRequest {
  /** Ordered list of task IDs */
  task_ids: number[];
}

export interface TaskRequest {
  /**
   * @minLength 1
   * @maxLength 200
   */
  title: string;
  description?: string;
  /**
   * @format int64
   * @min 0
   * @max 9223372036854776000
   */
  order?: number;
  /**
   * * `daily` - Daily
   * * `workdays` - Workdays (Mon-Fri)
   * * `weekly` - Weekly
   * * `monthly` - Monthly
   * * `yearly` - Yearly
   */
  recurrence_type: RecurrenceTypeEnum;
  recurrence_metadata?: any;
  /**
   * Time of day when task is due
   * @format time
   */
  due_time?: string | null;
  /** Whether to send alarm reminders */
  alarm_enabled?: boolean;
  /**
   * Minutes before due time to send alarm
   * @format int64
   * @min 0
   * @max 9223372036854776000
   */
  alarm_minutes_before?: number;
}

/** Serializer for today's routine response. */
export interface TodayRoutine {
  /** @format date */
  date: string;
  tasks: Task[];
}

export interface TokenRefresh {
  access: string;
  refresh: string;
}

export interface TokenRefreshRequest {
  /** @minLength 1 */
  refresh: string;
}

export interface User {
  id: number;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * @format email
   * @maxLength 254
   */
  email: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /** @maxLength 20 */
  phone?: string | null;
  /** @format date */
  date_of_birth?: string | null;
  is_verified: boolean;
  profile: UserProfile;
  social_accounts: string;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  updated_at: string;
}

export interface UserProfile {
  id: number;
  bio?: string;
  /** @format uri */
  avatar?: string | null;
  /** @maxLength 100 */
  location?: string;
  /**
   * @format uri
   * @maxLength 200
   */
  website?: string;
  /**
   * User's timezone for alarm scheduling
   * @maxLength 50
   */
  timezone?: string;
  roles: Role[];
  is_public?: boolean;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  updated_at: string;
}

export interface UserProfileRequest {
  bio?: string;
  /** @format binary */
  avatar?: File | null;
  /** @maxLength 100 */
  location?: string;
  /**
   * @format uri
   * @maxLength 200
   */
  website?: string;
  /**
   * User's timezone for alarm scheduling
   * @minLength 1
   * @maxLength 50
   */
  timezone?: string;
  role_ids?: number[];
  is_public?: boolean;
}

export interface UserRegistrationRequest {
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * @format email
   * @minLength 1
   * @maxLength 254
   */
  email: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /** @minLength 1 */
  password: string;
  /** @minLength 1 */
  password_confirm: string;
  /** @maxLength 20 */
  phone?: string | null;
  /** @format date */
  date_of_birth?: string | null;
}

export interface UserRequest {
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * @format email
   * @minLength 1
   * @maxLength 254
   */
  email: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /** @maxLength 20 */
  phone?: string | null;
  /** @format date */
  date_of_birth?: string | null;
  /** @minLength 1 */
  password: string;
}
