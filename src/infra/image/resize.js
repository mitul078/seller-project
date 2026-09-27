import sharp from "sharp"
import path from "path"

const SIZES = {
    thumbnail: 150,
    medium: 500,
    large: 1200,
}

export async function resize_image(input_path) {
    const folder = path.dirname(input_path)

    const entries = await Promise.all(
        Object.entries(SIZES).map(async ([label, width]) => {
            const output_path = path.join(folder, `${label}.webp`)

            await sharp(input_path)
                .resize({ width, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(output_path)

            return [label, output_path]c
        })
    )

    return Object.fromEntries(entries)
}