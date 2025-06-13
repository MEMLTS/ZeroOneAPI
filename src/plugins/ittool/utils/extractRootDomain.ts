/**
 * 提取 URL 中的主域名（root domain），自动识别常见双后缀域名（如 co.uk、com.cn 等）
 * @param url 输入的 URL 字符串
 * @returns 返回主域名，例如 example.com 或 example.co.uk；非法 URL 返回 null
 */
export function extractRootDomain(url: string): string | null {
    try {
        const normalizedUrl = url.startsWith("http://") || url.startsWith("https://")
            ? url
            : `http://${url}`;

        const { hostname } = new URL(normalizedUrl);

        const parts = hostname.split(".");

        const doubleSuffixes = new Set([
            "co.uk", "com.cn", "net.cn", "org.cn", "gov.cn", "ac.uk", "co.jp",
            "edu.cn", "com.au", "org.uk", "gov.uk", "co.in"
        ]);

        const lastTwo = parts.slice(-2).join(".");
        const lastThree = parts.slice(-3).join(".");

        if (doubleSuffixes.has(lastTwo) && parts.length >= 3) {
            return lastThree;
        }

        return lastTwo;
    } catch (err) {
        return null;
    }
}
