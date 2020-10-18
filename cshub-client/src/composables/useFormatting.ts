import dayjs from "dayjs";

export function useFormatting() {
    return {
        formatDate: (value: string): string => {
            return dayjs(value).format("DD-MM-YYYY, H:mm");
        },
        roundNumber: (value: number, decimals: number): string => {
            if (decimals !== null) {
                return value.toFixed(decimals);
            } else {
                return value.toFixed(2);
            }
        },
    };
}
