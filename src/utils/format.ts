/**
 * 格式化日期
 * @param date 日期字符串或时间戳
 * @returns 格式化后的日期字符串 YYYY-MM-DD HH:mm:ss
 */
export function formatDate(date: string | number | Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化数字
 * @param num 数字
 * @param digits 小数位数，默认为0
 * @returns 格式化后的数字字符串，每三位用逗号分隔
 */
export function formatNumber(num: number, digits: number = 0): string {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
} 