// Core FPL API Types
export interface BootstrapData {
  events: GameWeek[];
  game_settings: GameSettings;
  phases: Phase[];
  teams: Team[];
  total_players: number;
  elements: Player[];
  element_stats: ElementStat[];
  element_types: PlayerPosition[];
}

export interface GameWeek {
  id: number;
  name: string;
  deadline_time: string;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score: number;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  cup_leagues_created: boolean;
  h2h_ko_matches_created: boolean;
  chip_plays: ChipPlay[];
  most_selected: number;
  most_transferred_in: number;
  top_element: number;
  top_element_info: TopElementInfo;
  transfers_made: number;
  most_captained: number;
  most_vice_captained: number;
}

export interface Team {
  code: number;
  draw: number;
  form: string | null;
  id: number;
  loss: number;
  name: string;
  played: number;
  points: number;
  position: number;
  short_name: string;
  strength: number;
  team_division: number | null;
  unavailable: boolean;
  win: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  pulse_id: number;
}

export interface Player {
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  code: number;
  cost_change_event: number;
  cost_change_event_fall: number;
  cost_change_start: number;
  cost_change_start_fall: number;
  dreamteam_count: number;
  element_type: number;
  ep_next: string | null;
  ep_this: string | null;
  event_points: number;
  first_name: string;
  form: string;
  id: number;
  in_dreamteam: boolean;
  news: string;
  news_added: string | null;
  now_cost: number;
  photo: string;
  points_per_game: string;
  second_name: string;
  selected_by_percent: string;
  special: boolean;
  squad_number: number | null;
  status: string;
  team: number;
  team_code: number;
  total_points: number;
  transfers_in: number;
  transfers_in_event: number;
  transfers_out: number;
  transfers_out_event: number;
  value_form: string;
  value_season: string;
  web_name: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  influence_rank: number;
  influence_rank_type: number;
  creativity_rank: number;
  creativity_rank_type: number;
  threat_rank: number;
  threat_rank_type: number;
  ict_index_rank: number;
  ict_index_rank_type: number;
  corners_and_indirect_freekicks_order: number | null;
  corners_and_indirect_freekicks_text: string;
  direct_freekicks_order: number | null;
  direct_freekicks_text: string;
  penalties_order: number | null;
  penalties_text: string;
  expected_goals_per_90: number;
  saves_per_90: number;
  expected_assists_per_90: number;
  expected_goal_involvements_per_90: number;
  expected_goals_conceded_per_90: number;
  goals_conceded_per_90: number;
  now_cost_rank: number;
  now_cost_rank_type: number;
  form_rank: number;
  form_rank_type: number;
  points_per_game_rank: number;
  points_per_game_rank_type: number;
  selected_rank: number;
  selected_rank_type: number;
}

export interface PlayerPosition {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string;
  squad_select: number;
  squad_min_play: number;
  squad_max_play: number;
  ui_shirt_specific: boolean;
  sub_positions_locked: number[];
  element_count: number;
}

export interface Fixture {
  code: number;
  event: number;
  finished: boolean;
  finished_provisional: boolean;
  id: number;
  kickoff_time: string;
  minutes: number;
  provisional_start_time: boolean;
  started: boolean;
  team_a: number;
  team_a_score: number | null;
  team_h: number;
  team_h_score: number | null;
  stats: FixtureStat[];
  team_h_difficulty: number;
  team_a_difficulty: number;
  pulse_id: number;
}

export interface FixtureStat {
  identifier: string;
  a: StatValue[];
  h: StatValue[];
}

export interface StatValue {
  value: number;
  element: number;
}

export interface LiveData {
  elements: LiveElement[];
}

export interface LiveElement {
  id: number;
  stats: {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    total_points: number;
    in_dreamteam: boolean;
  };
  explain: ExplainPoint[];
}

export interface ExplainPoint {
  fixture: number;
  stats: ExplainStat[];
}

export interface ExplainStat {
  identifier: string;
  points: number;
  value: number;
}

// Computed/Helper Types
export interface PlayerWithTeam extends Player {
  team_info: Team;
  position_info: PlayerPosition;
  fixtures_next_5: Fixture[];
  average_fdr_next_5: number;
}

export interface FixtureWithTeams extends Fixture {
  team_h_info: Team;
  team_a_info: Team;
  kickoff_time_formatted: string;
  kickoff_time_sast: string;
}

// Form/Chart types
export interface PlayerFormData {
  gameweek: number;
  points: number;
  minutes: number;
  goals: number;
  assists: number;
}

// Additional helper types
export interface ChipPlay {
  chip_name: string;
  num_played: number;
}

export interface TopElementInfo {
  id: number;
  points: number;
}

export interface Phase {
  id: number;
  name: string;
  start_event: number;
  stop_event: number;
}

export interface GameSettings {
  league_join_private_max: number;
  league_join_public_max: number;
  league_max_size_public_classic: number;
  league_max_size_public_h2h: number;
  league_max_size_private_h2h: number;
  league_max_ko_rounds_private_h2h: number;
  league_prefix_public: string;
  league_points_h2h_win: number;
  league_points_h2h_lose: number;
  league_points_h2h_draw: number;
  league_ko_first_instead_of_random: boolean;
  cup_start_event_id: number;
  cup_stop_event_id: number;
  cup_qualifying_method: string;
  cup_type: string;
  squad_squadplay: number;
  squad_squadsize: number;
  squad_team_limit: number;
  squad_total_spend: number;
  ui_currency_multiplier: number;
  ui_use_special_shirts: boolean;
  ui_special_shirt_exclusions: number[];
  stats_form_days: number;
  sys_vice_captain_enabled: boolean;
  transfers_cap: number;
  transfers_sell_on_fee: number;
  timezone: string;
}

export interface ElementStat {
  label: string;
  name: string;
}

// User team types (for later phases)
export interface UserTeam {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  player_region_name: string;
  player_region_iso_code_short: string;
  player_region_iso_code_long: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  current_event: number;
  leagues: UserLeague[];
}

export interface UserLeague {
  id: number;
  name: string;
  short_name: string;
  created: string;
  closed: boolean;
  rank: number;
  max_entries: number;
  league_type: string;
  scoring: string;
  admin_entry: number;
  start_event: number;
  entry_rank: number;
  entry_last_rank: number;
  entry_movement: string;
  entry_change: number;
  entry_can_leave: boolean;
  entry_can_admin: boolean;
  entry_can_invite: boolean;
  has_cup: boolean;
  cup_league: number | null;
  cup_qualified: boolean;
}
