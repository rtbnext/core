import * as Const from '@/utils/Const';
import { Logger } from '@/utils/Logger';
import { Parser } from '@/utils/Parser';
import { ProfileParser } from '@/utils/ProfileParser';
import { Utils } from '@/utils/Utils';

const helper = {
    log: Logger.getInstance(),
    parser: Parser,
    profileParser: ProfileParser,
    utils: Utils
} as const;

export { Const, Logger, Parser, ProfileParser, Utils };
export default helper;
