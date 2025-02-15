import { RowStatus } from "./common/common";
import {
  DBInstanceId,
  ExternalId,
  ContributorId,
  CloudProvider,
} from "./common";
import { Region } from "./region";

export type InstanceFamily = "GENERAL" | "MEMORY";

export type DBInstance = {
  id: DBInstanceId;
  externalId: ExternalId;
  rowStatus: RowStatus;
  creatorId: ContributorId;
  updaterId: ContributorId;

  regionList: Region[];

  cloudProvider: CloudProvider;
  name: string;
  cpu: number;
  memory: string;
  processor: string;
};
