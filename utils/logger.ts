import { logger } from 'react-native-logs';

const config = {
    severity: 'debug', // puoi anche usare 'info' in produzione
    transportOptions: {
        colors: {
            info: 'blueBright',
            warn: 'yellowBright',
            error: 'redBright',
            debug: 'green',
        },
    },
    transport: (props: any) => {
        const timestamp = new Date().toISOString();
        const message = Array.isArray(props?.msg) ? props.msg.join(' ') : props?.msg;
        console.log(`[${timestamp}] ${message}`);
    },
};

export default logger.createLogger(config);
