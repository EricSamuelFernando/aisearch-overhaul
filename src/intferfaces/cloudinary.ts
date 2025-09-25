export interface Cloudinary {
  createUploadWidget<T extends CloudinaryEvent>(
    uploadConfig: UploadInterface,
    cb: (error: IErrorResponse, result: Event<T>) => void,
  ): WidgetInterface;

  openUploadWidget<T extends CloudinaryEvent>(
    uploadConfig: UploadInterface,
    cb: (error: IErrorResponse, result: Event<T>) => void,
  ): WidgetInterface;

  applyUploadWidget<T extends CloudinaryEvent>(
    element: HTMLElement,
    uploadConfig: UploadInterface,
    cb: (error: IErrorResponse, result: Event<T>) => void,
  ): WidgetInterface;

  setCloudName(name: string): void;
}
// Define all other types and interfaces here
export interface WidgetInterface {
  open(url?: string): void;
  close(quiet?: boolean): void;
  update(updateConfig: UploadInterface): void;
  hide(): void;
  show(): void;
  minimize(): void;
  isShowing(): boolean;
  isMinimized(): boolean;
}

export interface UploadInterface {
  cloudName: string;
  uploadPreset: string;
  clientAllowedFormats?: string[];
  maxFileSize?: number;
  maxImageFileSize?: number;
  theme?: 'default' | 'white' | 'minimal' | 'purple';
  buttonCaption?: string;
  buttonClass?: string;
  folder?: string;
  cropping?: boolean;
  sources?: Sources[];
  googleApiKey?: string;
  searchBySites?: Array<'all' | string>;
  searchByRights?: boolean;
  instagramClientId?: string;
  googleDriveClientId?: string;
  encryption?: {
    key: string;
    iv: string;
  };
  styles?: {
    palette: Record<string, string>;
    fonts: Record<string, string>;
  };
  getTags?: (cb: (tags: string[]) => void, prefix: string) => string[];
  language?: string;
  text?: Record<string, Record<string, string>>;
  showUploadMoreButton?: boolean;
  resourceType?: string;
}

export interface IErrorResponse {
  status: string;
  statusText: string;
}

export interface Event<T extends CloudinaryEvent> {
  data?: {
    event: T;
    info: CloudinaryEventInfoMap[T];
    type: string;
    widgetId: string;
  };
  event: T;
  info: CloudinaryEventInfoMap[T];
}

export type CloudinaryEvent =
  | 'abort'
  | 'batch-cancelled'
  | 'close'
  | 'display-changed'
  | 'publicid'
  | 'queues-end'
  | 'queues-start'
  | 'retry'
  | 'show-completed'
  | 'source-changed'
  | 'success'
  | 'tags'
  | 'upload-added';

export type CloudinaryEventInfoMap = {
  abort: {
    ids: [];
    all: true | false;
  };
  'batch-cancelled': {
    reason: 'MAX_EXCEEDED' | 'INVALID_PUBLIC_ID';
  };
  close: { message: string };
  'display-changed': 'shown' | 'hidden' | 'minimized' | 'expanded';
  publicid: { id: 'my-public-id' };
  'queues-end': {
    files: CFile[];
  };
  'queues-start': never;
  retry: {
    ids: [];
    all: true | false;
  };
  'show-completed': {
    items: Array<{
      id: string;
      name: string;
      size: number;
      type: string;
      status: string;
      done: boolean;
      progress: number;
      file: File;
      uploadInfo: UploadInfo;
    }>;
  };
  'source-changed': {
    source: Sources[];
  };
  success: UploadInfo & {
    id: string;
    batchId: string;
  };
  tags: { tags: string[] };
  'upload-added': {
    file: File;
    publicId: string;
  };
};

export type Sources =
  | 'local'
  | 'url'
  | 'facebook'
  | 'dropbox'
  | 'image_search'
  | 'camera'
  | 'instagram'
  | 'shutterstock'
  | 'google_drive';

export interface CFile {
  aborted: boolean;
  batchId: string;
  camera: boolean;
  coordinatesResize: boolean;
  delayedPreCalls: boolean;
  dimensions: [number, number];
  done: true;
  failed: boolean;
  id: string;
  imageDimensions: [];
  name: string;
  partOfBatch: boolean;
  paused: boolean;
  preparedParams: {};
  progress: number;
  publicId: string;
  publicIdCounter: number;
  size: number;
  status: CloudinaryEvent;
  statusText: CloudinaryEvent;
  type: string;
  uploadInfo: UploadInfo;
}

export interface UploadInfo {
  asset_id: string;
  bytes: number;
  created_at: string;
  etag: string;
  format: string;
  height: number;
  original_filename: string;
  path: string;
  placeholder: boolean;
  public_id: string;
  resource_type: string;
  secure_url: string;
  signature: string;
  tags: string[];
  thumbnail_url: string;
  type: string;
  url: string;
  version: number;
  version_id: string;
  width: number;
  id: string;
  batchId: string;
  folder: string;
  access_mode: string;
}
