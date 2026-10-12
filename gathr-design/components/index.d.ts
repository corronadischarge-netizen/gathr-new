import type * as React from 'react';
export type Crowd = 'quiet' | 'warming' | 'buzzing' | 'packed' | 'full';
export type Hue = 'yellow' | 'red' | 'pink' | 'violet' | 'green' | 'blue';
/** UI icons are Lucide (lucide.dev). These ship in the bundle; add other Lucide names to the bundle before use */
export type IconName = 'accessibility' | 'arrow-left' | 'arrow-right' | 'arrow-up-right' | 'at-sign' | 'audio-lines' | 'beer' | 'bell' | 'bell-ring' | 'bike' | 'bookmark' | 'calendar' | 'calendar-check' | 'calendar-plus' | 'camera' | 'car' | 'car-taxi-front' | 'check' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'cigarette-off' | 'circle-check' | 'clock' | 'coffee' | 'compass' | 'copy' | 'credit-card' | 'cup-soda' | 'disc-3' | 'download' | 'drum' | 'ellipsis' | 'external-link' | 'eye' | 'eye-off' | 'face-slightly-smiling-plus' | 'fingerprint-pattern' | 'flame' | 'footprints' | 'gift' | 'globe' | 'guitar' | 'headphones' | 'heart' | 'hourglass' | 'house' | 'id-card' | 'image' | 'images' | 'indian-rupee' | 'info' | 'link' | 'list-filter' | 'locate-fixed' | 'lock' | 'log-out' | 'map' | 'map-pin' | 'martini' | 'menu' | 'message-circle' | 'messages-square' | 'mic' | 'mic-vocal' | 'minus' | 'moon' | 'music' | 'music-2' | 'navigation' | 'party-popper' | 'pencil' | 'percent' | 'phone' | 'pizza' | 'play' | 'plus' | 'qr-code' | 'receipt' | 'refresh-cw' | 'scan-line' | 'search' | 'send' | 'settings' | 'share' | 'share-2' | 'shield-check' | 'shirt' | 'sliders-horizontal' | 'sparkles' | 'speaker' | 'star' | 'sun' | 'sunset' | 'tag' | 'ticket' | 'ticket-check' | 'timer' | 'trash' | 'triangle-alert' | 'upload' | 'user' | 'user-check' | 'user-plus' | 'users' | 'utensils' | 'video' | 'wallet' | 'wine' | 'wine-off' | 'x' | 'zap';
export interface WordmarkProps { size?: number; tone?: 'auto' | 'light' | 'dark'; className?: string; style?: React.CSSProperties }
export declare function Wordmark(props: WordmarkProps): React.ReactElement;
export interface IconProps { name: IconName; size?: number; label?: string; /** solid version, for active and selected states; available for the names in Icon.filledNames() */ filled?: boolean; className?: string }
export declare function Icon(props: IconProps): React.ReactElement;
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'brand' | 'glass' | 'subtle' | 'ghost' | 'tonal'; size?: 'sm' | 'md' | 'lg'; icon?: IconName; iconRight?: IconName; block?: boolean }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { icon: IconName; label: string; variant?: 'glass' | 'solid' | 'scrim' | 'tonal'; size?: number; active?: boolean }
export declare function IconButton(props: IconButtonProps): React.ReactElement;
export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { selected?: boolean; icon?: IconName }
export declare function Chip(props: ChipProps): React.ReactElement;
export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export declare function SearchField(props: SearchFieldProps): React.ReactElement;
export interface BadgeProps { tone?: 'neutral' | 'now' | 'go' | 'limit' | 'brand' | 'glass'; /** solid (default): one flat fill of the hue, ink text (white on violet). tint: a flat transparent 20% wash of the hue with a hue edge and -100 text */ look?: 'solid' | 'tint'; live?: boolean; children?: React.ReactNode }
export declare function Badge(props: BadgeProps): React.ReactElement;
export interface CrowdMeterProps { /** used when booked/cap are not given */ level?: Crowd; /** bookings on gathr so far */ booked?: number; /** the cap verified by gathr; the level is computed from booked/cap (under 25% Early, 25–59 Filling up, 60–84 Buzzing, 85–99 Packed, 100 Full) */ cap?: number; /** the count shows from this many bookings (default 50); below it the level line shows */ revealAt?: number; line?: string; compact?: boolean; glass?: boolean; /** row (default): bars, word and line. widget: a 176px card with the 60-dot grid and the count */ variant?: 'row' | 'widget'; eyebrow?: string; /** e.g. "6:40 pm": adds the trust line to the widget */ updated?: string }
export interface CrowdBlockProps { booked?: number; cap?: number; level?: Crowd; eyebrow?: string; revealAt?: number }
export declare function CrowdBlock(props: CrowdBlockProps): React.ReactElement;
export interface FactListProps { title?: string; rows: { icon?: IconName; label: string; value: string; /** a price: Jakarta 700, 20px */ strong?: boolean }[]; note?: string; /** rows only, no card */ bare?: boolean; className?: string }
export declare function FactList(props: FactListProps): React.ReactElement;
export interface TonightSoFarProps { booked?: number; saved?: number; lastHour?: number; friends?: string[]; friendsPeople?: FriendsGoingProps['people']; friendsTotal?: number; title?: string; className?: string }
export declare function TonightSoFar(props: TonightSoFarProps): React.ReactElement;
export declare function CrowdMeter(props: CrowdMeterProps): React.ReactElement;
export interface AvatarProps { name?: string; image?: string; size?: number; /** the person's vibe sticker: a 3D object url from assets/Stickers */ sticker?: string }
export declare function Avatar(props: AvatarProps): React.ReactElement;
export interface FriendsGoingProps { people?: { name: string; image?: string; sticker?: string }[]; names?: string[]; total?: number; /** 'booked' reads "Riya, Dev + 2 friends booked" */ verb?: 'going' | 'booked' }
export declare function FriendsGoing(props: FriendsGoingProps): React.ReactElement;
export interface ProgressBarProps { step: number; total: number }
export declare function ProgressBar(props: ProgressBarProps): React.ReactElement;
export type Recipe = 'peak' | 'uv' | 'sundowner' | 'comedown';
export interface BloomProps { recipe?: Recipe; at?: 'bottom' | 'low' | 'center' | 'top'; still?: boolean; style?: React.CSSProperties }
export declare function Bloom(props: BloomProps): React.ReactElement;
export interface TopBarProps { avatar?: string; avatarImage?: string; back?: boolean; title?: string; actions?: [IconName, string][]; glass?: boolean }
export declare function TopBar(props: TopBarProps): React.ReactElement;
export interface TabBarProps { active?: 'tonight' | 'map' | 'search' | 'plans' | 'you'; onChange?: (tab: string) => void }
export declare function TabBar(props: TabBarProps): React.ReactElement;
export interface SheetProps { title: string; subtitle?: string; children?: React.ReactNode; onClose?: () => void }
export declare function Sheet(props: SheetProps): React.ReactElement;
export interface VenueCardProps { name: string; area?: string; distance?: string; vibes?: string[]; crowd?: Crowd; friends?: string[]; friendsPeople?: FriendsGoingProps['people']; friendsTotal?: number; doorTime?: string; cover?: string; live?: boolean; badge?: string; image?: string; saved?: boolean; hue?: Hue }
export declare function VenueCard(props: VenueCardProps): React.ReactElement;
export interface FeatureCardProps { occasion?: boolean; image?: string; recipe?: Recipe; kicker?: string; kickerIcon?: IconName; title: string; body?: string; action?: string; actionIcon?: IconName }
export interface VenueHeroProps { name: string; occasion?: boolean; image?: string; recipe?: Recipe; /** the sub line after the area, e.g. "Hard techno · Episode 7" */ vibe?: string; area?: string; booked?: number; cap?: number; /** fallback level when there are no bookings data */ crowd?: Crowd; cover?: string; /** replaces the Cover label, e.g. "early bird" */ coverNote?: string; doorTime?: string; music?: string; distance?: string; /** e.g. "6:40 pm" */ updated?: string; action?: string; actionVariant?: 'brand' | 'primary'; /** disables the booking button when someone can't book; say why in `action`, e.g. "21+ only" */ actionDisabled?: boolean; saved?: boolean }
export declare function VenueHero(props: VenueHeroProps): React.ReactElement;
export declare function FeatureCard(props: FeatureCardProps): React.ReactElement;
export interface RankCardProps { rank: number; title: string; subtitle?: string; hue?: Hue; image?: string; action?: string }
export declare function RankCard(props: RankCardProps): React.ReactElement;
export interface EventCardProps { image?: string; title: string; kicker?: string; meta?: string; badge?: string; badgeTone?: BadgeProps['tone']; live?: boolean; action?: string; style?: React.CSSProperties }
export declare function EventCard(props: EventCardProps): React.ReactElement;
export interface PageIndicatorProps { count?: number; active?: number }
export declare function PageIndicator(props: PageIndicatorProps): React.ReactElement;
export interface EventRowProps { title: string; day?: string; time?: string; venue?: string; price?: string; status?: 'soldout' | 'filling' | 'onlist'; image?: string; hue?: Hue }
export declare function EventRow(props: EventRowProps): React.ReactElement;
export interface MapPinProps { level: Crowd; label?: string; selected?: boolean; /** URL of the venue's 3D sticker icon */ sticker?: string; icon?: IconName; /** false below zoom 14 */ showLabel?: boolean }
export declare function MapPin(props: MapPinProps): React.ReactElement;
export interface VibeTagProps { hue?: Hue; tail?: 'left' | 'right'; tilt?: number; children?: React.ReactNode }
export declare function VibeTag(props: VibeTagProps): React.ReactElement;
export interface PhotoFrameProps { image?: string; width?: number; height?: number; tilt?: number; hue?: Hue; style?: React.CSSProperties }
export declare function PhotoFrame(props: PhotoFrameProps): React.ReactElement;
export type ChainSegment = { label: string; tone?: 'white' | 'outline' | Hue } | { arrow: true; tone?: Hue } | { echo: Hue };
export interface PillChainProps { rows: ChainSegment[][]; scale?: number }
export declare function PillChain(props: PillChainProps): React.ReactElement;
export interface StatBubblesProps { items: { value: number; display?: string; label?: string; hue?: Hue }[]; size?: number }
export declare function StatBubbles(props: StatBubblesProps): React.ReactElement;
export interface DotGridProps { value: number; label?: string; hue?: Hue }
export declare function DotGrid(props: DotGridProps): React.ReactElement;
export interface SocialSlideProps { occasion?: boolean; pillar: 'upgrade' | 'insider' | 'mirror' | 'standard'; kind?: 'cover' | 'body' | 'end'; headline: string; kicker?: string; body?: string; index?: number; total?: number; format?: 'post' | 'story'; handle?: string; scale?: number }
export declare function SocialSlide(props: SocialSlideProps): React.ReactElement;
export interface EventPosterProps { occasion?: boolean; recipe?: Recipe; hue?: Hue; altHue?: Hue; kicker?: string; name: string; series?: string; date: string; time: string; venue: string; support?: string; scale?: number }
export declare function EventPoster(props: EventPosterProps): React.ReactElement;
export interface SiteHeaderProps { links?: string[]; cta?: string }
export declare function SiteHeader(props: SiteHeaderProps): React.ReactElement;
export interface StickerProps { src?: string; size?: number; tilt?: number; /** the one sticker per screen that floats; everything else stays still */ bob?: boolean; /** @deprecated stickers are still by default */ still?: boolean; alt?: string; label?: string; style?: React.CSSProperties; className?: string }
export declare function Sticker(props: StickerProps): React.ReactElement;
export interface MoodTileProps { title: string; kicker?: string; sticker?: string; stickerSize?: number; tilt?: number; action?: string; selected?: boolean; style?: React.CSSProperties }
export declare function MoodTile(props: MoodTileProps): React.ReactElement;
export interface RingAvatarProps { name?: string; image?: string; sticker?: string; size?: number; ring?: 'brand' | 'go' | 'none'; badge?: 'check' | 'star'; style?: React.CSSProperties; className?: string }
export declare function RingAvatar(props: RingAvatarProps): React.ReactElement;
export interface TagPillProps { icon?: IconName; tone?: 'light' | 'glass' | 'dark' | 'go' | 'brand'; children?: React.ReactNode; style?: React.CSSProperties; className?: string }
export declare function TagPill(props: TagPillProps): React.ReactElement;
export interface ReactionBubbleProps { emoji: string[]; tail?: 'left' | 'right'; label?: string; style?: React.CSSProperties; className?: string }
export declare function ReactionBubble(props: ReactionBubbleProps): React.ReactElement;
export interface CommentBubbleProps { name?: string; image?: string; children?: React.ReactNode; style?: React.CSSProperties; className?: string }
export declare function CommentBubble(props: CommentBubbleProps): React.ReactElement;
export interface StoryCardProps { image?: string; title: string; meta?: string; place?: string; status?: string; people?: { name: string; image?: string }[]; style?: React.CSSProperties }
export declare function StoryCard(props: StoryCardProps): React.ReactElement;
export interface CardDeckProps { active?: number; children?: React.ReactNode }
export declare function CardDeck(props: CardDeckProps): React.ReactElement;
export interface PhotoStackProps { images: string[]; reply?: string; liked?: boolean; onLike?: () => void; children?: React.ReactNode }
export declare function PhotoStack(props: PhotoStackProps): React.ReactElement;
export interface EchoPatternProps { /** the Bloom recipe for the glowing edges and the ground */ recipe?: Recipe; /** number of echoes, default 4 */ rings?: number; /** the gathr wordmark in the middle; false for a plain backdrop */ logo?: boolean; children?: React.ReactNode; style?: React.CSSProperties; className?: string }
export declare function EchoPattern(props: EchoPatternProps): React.ReactElement;
declare global { interface Window { Gathr: { Wordmark: typeof Wordmark; Icon: typeof Icon; Button: typeof Button; IconButton: typeof IconButton; Chip: typeof Chip; SearchField: typeof SearchField; Badge: typeof Badge; CrowdMeter: typeof CrowdMeter; Avatar: typeof Avatar; FriendsGoing: typeof FriendsGoing; ProgressBar: typeof ProgressBar; PageIndicator: typeof PageIndicator; Bloom: typeof Bloom; TopBar: typeof TopBar; TabBar: typeof TabBar; Sheet: typeof Sheet; VenueHero: typeof VenueHero; VenueCard: typeof VenueCard; FeatureCard: typeof FeatureCard; RankCard: typeof RankCard; EventCard: typeof EventCard; EventRow: typeof EventRow; MapPin: typeof MapPin; VibeTag: typeof VibeTag; PhotoFrame: typeof PhotoFrame; PillChain: typeof PillChain; StatBubbles: typeof StatBubbles; DotGrid: typeof DotGrid; SocialSlide: typeof SocialSlide; EventPoster: typeof EventPoster; SiteHeader: typeof SiteHeader; Sticker: typeof Sticker; MoodTile: typeof MoodTile; RingAvatar: typeof RingAvatar; TagPill: typeof TagPill; ReactionBubble: typeof ReactionBubble; CommentBubble: typeof CommentBubble; StoryCard: typeof StoryCard; CardDeck: typeof CardDeck; PhotoStack: typeof PhotoStack; EchoPattern: typeof EchoPattern; Ticket: typeof Ticket } } }

export interface TicketProps {
  /** event hue: one per event */ hue: Hue;
  /** pop colour for the vibe tag and arrow; defaults to the hue's partner (violet/blue/red → yellow, pink/green/yellow → violet) */ popHue?: Hue;
  /** 'hue' (default) or 'night': black with a still bloom; gathr-hosted nights default to night */ ground?: 'hue' | 'night'; recipe?: Recipe;
  name: string; /** the vibe tag, top right: series or vibe */ kicker?: string;
  /** joined into one pill: "Sat 04.10" */ day?: string; date?: string; time?: string; venue?: string;
  /** gathr-hosted: lowercase name + yellow full stop, night ground */ hosted?: boolean;
  number?: string; code?: string; admit?: string; scale?: number; tilt?: number; style?: React.CSSProperties; className?: string;
}
export declare function Ticket(props: TicketProps): React.ReactElement;

export interface UpdateProps { kind?: 'task' | 'chance' | 'decide' | 'info'; title: string; /** one line, ~32 characters max; the time is appended */ meta?: string; time?: string; /** task/chance button label, e.g. "Fix", "Book" */ action?: string; /** a night's 3D object */ object?: string; /** a person's photo */ image?: string; /** gathr's own updates */ icon?: IconName; tone?: 'go' | 'limit' | 'brand' | 'wait'; unread?: boolean; acceptLabel?: string; declineLabel?: string; onAction?: () => void; onAccept?: () => void; onDecline?: () => void; className?: string }
export declare function Update(props: UpdateProps): React.ReactElement;
export interface UpdateLeadProps { object?: string; image?: string; icon?: IconName; tone?: 'go' | 'limit' | 'brand' | 'wait' }
export declare function UpdateLead(props: UpdateLeadProps): React.ReactElement;
export interface UpdateGroupProps { title: string; aside?: string; children?: React.ReactNode; className?: string }
export declare function UpdateGroup(props: UpdateGroupProps): React.ReactElement;
export interface ToastProps { children?: React.ReactNode; action?: string; onAction?: () => void; className?: string }
export declare function Toast(props: ToastProps): React.ReactElement;

export interface ActionBarProps { /** up to two; each needs a label */ icons?: { icon: IconName; label: string; onClick?: () => void }[]; main: { label: string; icon?: IconName; variant?: 'brand' | 'primary'; disabled?: boolean; onClick?: () => void }; className?: string }
export declare function ActionBar(props: ActionBarProps): React.ReactElement;
