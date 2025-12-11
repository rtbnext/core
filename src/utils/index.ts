import { Base } from '@/utils/Base';
import { ConfigLoader } from '@/utils/ConfigLoader';
import * as Const from '@/utils/Const';
import { Logger } from '@/utils/Logger';
import { Parser } from '@/utils/Parser';

const Utils = {
    base: Base, config: ConfigLoader,
    logger: Logger, parser: Parser
};

export default Utils;
export { Const, Base, ConfigLoader, Logger, Parser };
