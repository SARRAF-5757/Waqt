# Waqt

A simple React Native app for helping you improve your prayer habits.

### Personal Story
The motivation behind this app is procrastination. Its easy to forget the priority of prayer in our busy lives and for me personally, what happens is I keep putting it off for longer and longer until I suddenly look at my phone and realize the next prayer is coming up and pray at the last second or miss it completely. I have seen other apps that remind you about the adhan, but for those of us that don't pray right when we hear the adhan, getting a second reminder becomes hard. And that's where I believe this app will help. YOU will tell the app when YOU can pray and it will intelligently take your preferences and prayer time shifts throughout the year into account to remind you to pray at the right time. And hopefully seeing countless checked off boxes in the history page will give you a little boost to keep going!

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
