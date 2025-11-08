import React from 'react'
import EmojiPicker, {EmojiStyle, Theme} from "emoji-picker-react";
import {emojiCategory} from "@/constants";
import EmojiPickerReact from "emoji-picker-react/src/EmojiPickerReact";
import {useTheme} from "@/components/ThemeProvider";

const MyEmojipicker = ({...props}: React.ComponentProps<typeof EmojiPickerReact>) => {
    const {theme} = useTheme();
    return (
        <EmojiPicker className={"body1"} {...props} theme={theme.mode == "light" ? Theme.LIGHT: Theme.DARK} height={300} width="100%" categories={emojiCategory} emojiStyle={"native" as EmojiStyle} searchPlaceHolder={"Tìm kiếm"} previewConfig={{showPreview: false}}/>
    )
}
export default MyEmojipicker
