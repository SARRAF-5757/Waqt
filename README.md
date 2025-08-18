# Waqt

A simple React Native app for helping you improve your prayer habits.

<img src="https://github.com/SARRAF-5757/Waqt/blob/master/assets/images/icons/ios-light.png?raw=true" alt="App Icon" width="50%" style="border-radius: 50%; display: block; margin-left: auto; margin-right: auto;" />


### Personal Story
The motivation behind this app comes from my own struggle with procrastination. In our busy lives, it's easy to not prioritize prayer. For me, I often find myself putting it off until suddenly I notice the next prayer is approaching—and then I either rush to pray at the last second or miss it entirely. While there are other apps that remind you at Adhan time, they don't help much if you can't pray right away. Getting a second, well-timed reminder is hard. That's where this app comes in: YOU tell the app when you're able to pray, and it will learn your preferences and adjust to prayer time shifts throughout the year, reminding you at the right moment. And I hope as you see more and more checked-off boxes in your history, you'll get the boost to keep going and make prayer a consistent part of your day.

## Features (for now)
- Track daily prayer completion with a GitHub contribution graph style streak grid
- Material You dynamic theming (for Android only) and custom color selection
- No internet access required, all data is stored locally

## Upcoming Features
- _Waqt_ and location-based prayer notifications
- More advanced score system to take _kaza_ prayers into account
- More ways to represent your history data (Bar charts, Heatmaps, Month view, Year view, etc)
- Ability to keep track of prayer data for as long or delete until a specific date
- Custom reminder & "custom reminder offset until prayer time expires" option in settings

### Installation
#### <u>Android</u>
Just install the APK file in release

#### <u>IOS</u>
(Until (and if) I post it on the App Store)
1. Clone this repository:
   ```sh
   git clone https://github.com/SARRAF-5757/Waqt.git
   cd Waqt
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the Expo development server:
   ```sh
   npx expo start
   ```
4. Scan the QR code with the Expo Go app on your phone, or run on an emulator.


## Known Issues
- prayer resetting at 4 am everyday
    - this will be the default behavior until I implement time & location based reminders

<br>
<br>
<br>
<br>


# For interested devs

## Project Structure
- `app/(tabs)/index.tsx` — Home screen, check off today's prayers
- `app/(tabs)/streak.tsx` — Visual streak grid for each prayer
- `app/(tabs)/settings.tsx` — Theme and color settings
- `providers/` — Custom React Context providers for habits and theming
- `components/` — Themed UI components
- `constants/` — Habit/prayer definitions and helpers

## How It Works
- All habit/prayer data is managed by a custom React Context provider (`HabitProvider`).
- Theme color is managed by a separate provider (`MaterialYouProvider`).
- Data is stored in local storage (AsyncStorage) and loaded automatically.

## License
MIT
