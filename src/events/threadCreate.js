module.exports = {
    name: 'threadCreate',
    async execute(client, thread) {
        // Versucht automatisch allen neuen joinbaren Threads beizutreten (z.B. für Archiv- und Listenfunktionen)
        try {
            if (thread.joinable && !thread.joined) {
                await thread.join();
            }
        } catch (err) {
            console.warn(`[threadCreate] Fehler beim Thread-Join:`, err);
        }
    }
};
